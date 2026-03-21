import pandas as pd
from supabase import create_client
from sklearn.ensemble import RandomForestClassifier

# 1. Setup Connection
url = "https://euinlbrrdvzqeaniakyo.supabase.co"
key = ""
supabase = create_client(url, key)


def get_prediction_data(user_uuid):
    # 1. Fetch User Preferences & Data
    user_res = supabase.table("user_preferences") \
        .select("*, user_data(*)") \
        .eq("id_user", user_uuid) \
        .single().execute()

    user_profile = user_res.data

    # 2. Fetch All Available Dishes and their Tags from our View
    dish_res = supabase.table("dish_with_tags_view").select("*").execute()
    menu_items = dish_res.data

    return user_profile, menu_items


def predict_best_dish(user_prefs, dishes_with_tags, current_weather):
    scores = {}

    for dish in dishes_with_tags:
        score = 0
        tags = dish['tags']  # List of tags like ['meat', 'warm', 'spicy']

        # --- 1. Hard Constraints (The "No-Go" List) ---
        if user_prefs['is_vegetarian'] and 'meat' in tags: continue
        if user_prefs['is_vegan'] and ('meat' in tags or 'dairy' in tags or 'egg' in tags): continue
        if user_prefs['is_nut_allergy'] and 'nuts' in tags: continue

        # --- 2. Preference Matching ---
        if user_prefs['warm'] and 'warm' in tags: score += 5
        if user_prefs['cold'] and 'cold' in tags: score += 5

        # Match spice tolerance
        if 'spicy' in tags:
            score += user_prefs['spice_tolerance']

            # --- 3. Weather Context ---
        if current_weather == "Rainy" and 'warm' in tags:
            score += 3  # Rain makes people want warm food
        if current_weather == "Clear" and 'cold' in tags:
            score += 2  # Sunny days might favor cold dishes

        scores[dish['name']] = score

    # Sort dishes by highest score
    recommended = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return recommended[0] if recommended else "No suitable dish found"


user_id = 0
profile, menu = get_prediction_data(user_id)
# print(f"Prediction: {predict_best_dish(user_a, current_dishes, 'Rainy')}")
