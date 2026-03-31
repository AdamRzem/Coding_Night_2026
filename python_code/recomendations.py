import argparse
import json
import os
import pandas as pd
from supabase import create_client
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from datetime import datetime

DEFAULT_SUPABASE_URL = ""
DEFAULT_SUPABASE_KEY = ""
supabase = None


def get_supabase_client():
    """
    Lazily initializes Supabase client from environment variables.
    """
    global supabase

    if supabase is not None:
        return supabase

    supabase_url = os.getenv("SUPABASE_URL", DEFAULT_SUPABASE_URL)
    supabase_key = os.getenv("SUPABASE_KEY", DEFAULT_SUPABASE_KEY)

    if not supabase_url or not supabase_key:
        raise RuntimeError(
            "Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_KEY in environment."
        )

    supabase = create_client(supabase_url, supabase_key)
    return supabase

# ──────────────────────────────────────────────
# DATA FETCHING
# ──────────────────────────────────────────────

def get_all_orders():
    """
    Fetches all orders from all users with joined user_data.
    Used for training the model.
    """
    try:
        client = get_supabase_client()
        response = client.table("client_order").select("*, user_data(*)").execute()
        return response.data
    except Exception as e:
        print(f"Error fetching orders: {e}")
        return []


def get_user_preferences(user_uuid):
    """
    Fetches preferences for a specific user.
    Returns empty dict if not found.
    """
    try:
        client = get_supabase_client()
        response = (
            client.table("user_preferences")
            .select("*")
            .eq("id_user", user_uuid)
            .execute()
        )
        return response.data[0] if response.data else {}
    except Exception as e:
        print(f"Error fetching preferences: {e}")
        return {}


# ──────────────────────────────────────────────
# DATA PREPARATION
# ──────────────────────────────────────────────

def order_to_row(order, prefs):
    """
    Converts a single order + preferences dict into a flat feature row.
    """
    user = order.get("user_data") or {}
    created_at = pd.to_datetime(order.get("created_at"), format="ISO8601")

    return {
        "dish_id":               order.get("id_dish"),
        "id_client":             order.get("id_client"),
        "temp":                  order.get("temp_celsius", 0),
        "weather":               order.get("weather", 0),
        "hour":                  created_at.hour,
        "day_of_week":           created_at.dayofweek,
        "month":                 created_at.month,
        "user_gender":           user.get("gender", 0),
        "user_class":            user.get("class", 0),
        "is_student":            int(user.get("is_student", False)),
        "is_vegetarian":         int(prefs.get("is_vegetarian", False)),
        "is_vegan":              int(prefs.get("is_vegan", False)),
        "is_nut_allergy":        int(prefs.get("is_nut_allergy", False)),
        "is_gluten_allergy":     int(prefs.get("is_gluten_allergy", False)),
        "is_shellfish_allergy":  int(prefs.get("is_shellfish_allergy", False)),
        "is_dairy_allergy":      int(prefs.get("is_dairy_allergy", False)),
        "spice_tolerance":       prefs.get("spice_tolerance", 0),
        "sweetness_preference":  prefs.get("sweetness_preference", 0),
        "warm":                  int(prefs.get("warm", False)),
        "cold":                  int(prefs.get("cold", False)),
        "with_drink":            int(prefs.get("with_drink", False)),
        "preferred_cuisine":     prefs.get("preferred_cuisine", 0),
    }


def build_training_dataframe(all_orders):
    """
    Builds training DataFrame from all orders.
    Fetches preferences per user (cached to avoid duplicate requests).
    """
    prefs_cache = {}
    rows = []

    for order in all_orders:
        uid = order.get("id_client")
        if uid not in prefs_cache:
            prefs_cache[uid] = get_user_preferences(uid)
        rows.append(order_to_row(order, prefs_cache[uid]))

    return pd.DataFrame(rows)


def encode_categoricals(df, columns):
    """
    Label-encodes specified columns in place.
    Returns the encoder dict so we can reuse it for prediction rows.
    """
    encoders = {}
    for col in columns:
        if df[col].dtype == object:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col].astype(str))
            encoders[col] = le
    return encoders


CATEGORICAL_COLS = ["user_gender", "user_class", "preferred_cuisine"]
FEATURE_COLS = [
    "temp", "weather", "hour", "day_of_week", "month",
    "user_gender", "user_class", "is_student",
    "is_vegetarian", "is_vegan", "is_nut_allergy", "is_gluten_allergy",
    "is_shellfish_allergy", "is_dairy_allergy",
    "spice_tolerance", "sweetness_preference",
    "warm", "cold", "with_drink", "preferred_cuisine",
]


# ──────────────────────────────────────────────
# MODEL TRAINING
# ──────────────────────────────────────────────

def train_model(verbose=True):
    """
    Fetches all orders, builds DataFrame, trains RandomForest.
    Evaluates accuracy on a held-out test set, then retrains on full data.
    Returns (model, encoders) — both needed for prediction.
    """
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import accuracy_score, classification_report

    if verbose:
        print("Fetching all orders for training...")
    all_orders = get_all_orders()

    if not all_orders:
        raise ValueError("No training data found.")

    df = build_training_dataframe(all_orders)
    encoders = encode_categoricals(df, CATEGORICAL_COLS)

    X = df[FEATURE_COLS]
    y = df["dish_id"]

    # stratify=y keeps class proportions in train and test.
    # Without this, some dishes might appear only in test and cause errors.
    # Falls back to random split if any class has only 1 sample.
    try:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
    except ValueError:
        if verbose:
            print("Warning: too few samples per class for stratified split, using random split.")
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

    # Train on training portion only for honest evaluation
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # ── ACCURACY ──────────────────────────────────────────────────
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)

    if verbose:
        print(f"\n{'─' * 45}")
        print(f"  Training samples : {len(X_train)}")
        print(f"  Test samples     : {len(X_test)}")
        print(f"  Unique dishes    : {y.nunique()}")
        print(f"  Test Accuracy    : {acc:.2%}")
        print(f"{'─' * 45}")
        print("\nPer-dish performance:")
        print(classification_report(y_test, y_pred, zero_division=0))

    # Retrain on ALL data — evaluation is done, now use everything for best predictions
    model.fit(X, y)
    if verbose:
        print("Model retrained on full dataset for deployment.")

    return model, encoders
# ──────────────────────────────────────────────
# PREDICTION
# ──────────────────────────────────────────────

def predict_for_user(user_id, temp_celsius, weather, model, encoders, top_n=5):
    """
    Predicts top N dishes for a specific user right now.

    Args:
        user_id:      UUID of the user to predict for
        temp_celsius: current temperature from sensor (float)
        weather:      current weather code from sensor (int/float)
        model:        trained RandomForestClassifier
        encoders:     dict of LabelEncoders from training
        top_n:        how many recommendations to return

    Returns:
        DataFrame with columns [dish_id, chance_%]
    """
    prefs = get_user_preferences(user_id)
    now = datetime.now()

    # Build a single-row dict with current context
    row = {
        "id_client":             user_id,
        "temp":                  temp_celsius,
        "weather":               weather,
        "hour":                  now.hour,
        "day_of_week":           now.weekday(),
        "month":                 now.month,
        "user_gender":           0,           # will be filled from prefs below
        "user_class":            0,
        "is_student":            0,
        "is_vegetarian":         int(prefs.get("is_vegetarian", False)),
        "is_vegan":              int(prefs.get("is_vegan", False)),
        "is_nut_allergy":        int(prefs.get("is_nut_allergy", False)),
        "is_gluten_allergy":     int(prefs.get("is_gluten_allergy", False)),
        "is_shellfish_allergy":  int(prefs.get("is_shellfish_allergy", False)),
        "is_dairy_allergy":      int(prefs.get("is_dairy_allergy", False)),
        "spice_tolerance":       prefs.get("spice_tolerance", 0),
        "sweetness_preference":  prefs.get("sweetness_preference", 0),
        "warm":                  int(prefs.get("warm", False)),
        "cold":                  int(prefs.get("cold", False)),
        "with_drink":            int(prefs.get("with_drink", False)),
        "preferred_cuisine":     prefs.get("preferred_cuisine", 0),
    }

    # Apply same encoders used during training for categorical columns
    # If value is unseen, fall back to 0
    input_df = pd.DataFrame([row])
    for col, le in encoders.items():
        val = str(input_df[col].iloc[0])
        if val in le.classes_:
            input_df[col] = le.transform([val])
        else:
            input_df[col] = 0

    probs = model.predict_proba(input_df[FEATURE_COLS])[0]

    recommendations = pd.DataFrame({
        "dish_id":     model.classes_,
        "probability": probs,
    })
    recommendations = recommendations.sort_values("probability", ascending=False)
    recommendations["chance_%"] = (recommendations["probability"] * 100).round(2)

    return recommendations[["dish_id", "chance_%"]].head(top_n).reset_index(drop=True)


def run_recommendation_cli(user_id, temp_celsius, weather, top_n):
    """
    Runs recommender and prints JSON payload for Node/Svelte integration.
    """
    model, encoders = train_model(verbose=False)
    result = predict_for_user(
        user_id=user_id,
        temp_celsius=temp_celsius,
        weather=weather,
        model=model,
        encoders=encoders,
        top_n=top_n,
    )

    recommendations = [
        {
            "dish_id": int(row["dish_id"]),
            "chance_%": float(row["chance_%"]),
        }
        for _, row in result.iterrows()
    ]

    print(json.dumps({"ok": True, "recommendations": recommendations}))


# ──────────────────────────────────────────────
# ENTRY POINT
# ──────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Dish recommendation trainer/predictor")
    parser.add_argument("--recommend", action="store_true", help="Return recommendations as JSON")
    parser.add_argument("--user-id", type=str, help="Target user UUID")
    parser.add_argument("--temp", type=float, default=12.5, help="Current temperature")
    parser.add_argument("--weather", type=float, default=2, help="Current weather code")
    parser.add_argument("--top-n", type=int, default=5, help="Number of recommendations")
    args = parser.parse_args()

    if args.recommend:
        if not args.user_id:
            print(json.dumps({"ok": False, "error": "--user-id is required in --recommend mode"}))
            raise SystemExit(1)

        try:
            run_recommendation_cli(
                user_id=args.user_id,
                temp_celsius=args.temp,
                weather=args.weather,
                top_n=args.top_n,
            )
        except Exception as e:
            print(json.dumps({"ok": False, "error": str(e)}))
            raise SystemExit(1)
        raise SystemExit(0)

    # Train once on all data
    model, encoders = train_model(verbose=True)

    # ── Example call ──────────────────────────────────────
    # temp and weather come from your sensors elsewhere in the codebase
    TARGET_USER = "03ec4093-a950-48ea-a95e-7459b945aeda"
    CURRENT_TEMP = 12.5       # <-- pass from sensor
    CURRENT_WEATHER = 2       # <-- pass from sensor

    result = predict_for_user(
        user_id=TARGET_USER,
        temp_celsius=CURRENT_TEMP,
        weather=CURRENT_WEATHER,
        model=model,
        encoders=encoders,
    )

    print(f"\nTop 5 recommendations for user {TARGET_USER}:")
    print(result)
