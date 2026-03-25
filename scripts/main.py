import pandas as pd
from supabase import create_client
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import numpy as np

url = "https://euinlbrrdvzqeaniakyo.supabase.co"
key = ""
supabase = create_client(url, key)

# GET DATA FUNCTIONS

def get_user_data(user_uuid):
    """
    Fetches both data and preferences for a specific ID.
    """
    try:
        response = supabase.table("client_order").select("*, user_data(*)").eq("id_client",user_uuid).execute()

        return response.data

    except Exception as e:
        print(f"Error: {e}")
        return None

def get_user_preferences(user_uuid):
    """
    Fetches preferences for a specific ID.
    :param user_uuid:
    :return preferences:
    """
    try:
        response = supabase.table("user_preferences").select("*").eq("id_user", user_uuid).execute()
        return response.data

    except Exception as e:
        print(f"Error: {e}")
        return None

def prepare_dataframe(raw_data, preferences):
    flat_list = []
    prefs = preferences[0] if preferences else {}
    for order in raw_data:
        user = order.get('user_data', {})

        row = {
            'dish_id': order.get('id_dish'),
            'created_at': order.get('created_at'),
            'temp': order.get('temp_celsius'),
            'weather': order.get('weather'),
            'user_gender': user.get('gender'),
            'user_class': user.get('class'),
            'is_student': user.get('is_student'),
            'is_vegetarian': prefs.get('is_vegetarian', False),
            'is_vegan': prefs.get('is_vegan', False),
            'is_nut_allergy': prefs.get('is_nut_allergy', False),
            'is_gluten_allergy': prefs.get('is_gluten_allergy', False),
            'is_shellfish_allergy': prefs.get('is_shellfish_allergy', False),
            'is_dairy_allergy':prefs.get('is_dairy_allergy', False),
            'spice_tolerance': prefs.get('spice_tolerance', 0),
            'sweetness_preference': prefs.get('sweetness_preference', 0),
            'warm': prefs.get('warm', 0),
            'cold': prefs.get('cold', 0),
            'with_drink': prefs.get('with_drink', 0),
            'preferred_cuisine': prefs.get('preferred_cuisine', 0),
        }
        flat_list.append(row)

    dataframe = pd.DataFrame(flat_list)

    # THE FIX:
    dataframe['created_at'] = pd.to_datetime(dataframe['created_at'], format='ISO8601')

    # ADD THESE for your model:
    dataframe['hour'] = dataframe['created_at'].dt.hour
    dataframe['day_of_week'] = dataframe['created_at'].dt.dayofweek

    return dataframe

# GETTING DATA

target_user_id = "03ec4093-a950-48ea-a95e-7459b945aeda"
user_info = get_user_data(target_user_id)
# print(user_info)

preferences = get_user_preferences(target_user_id)
# print(preferences)
df = prepare_dataframe(user_info,preferences)
# print(df.columns.values)

# PREPARING DATA
# ENCODING STRING VALUES
pd.set_option('display.max_columns', None)

X = df.drop('dish_id', axis=1)
X = X.drop('created_at', axis=1)
y = df['dish_id']

# BAGGING

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# PREDICTIONS
# print(X_train, y_train)
# print(X_test.shape, y_test.shape)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

accuracy = model.score(X_test, y_test)
print(f"Accuracy: {accuracy:.2%}")

# Recommendations

probs = model.predict_proba(X_test)

user_index = 0
user_probs = probs[user_index]

recommendations = pd.DataFrame({
    'dish_id': model.classes_,
    'probability': user_probs
})

recommendations = recommendations.sort_values(by='probability', ascending=False)

recommendations['chance_%'] = (recommendations['probability'] * 100).round(2)

print(f"--- Top 5 rekomendacji dla użytkownika (Index: {user_index}) ---")
print(recommendations[['dish_id', 'chance_%']].head(5))
