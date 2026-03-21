import pandas as pd
from supabase import create_client
from sklearn.ensemble import RandomForestClassifier

# 1. Setup Connection
url = "https://euinlbrrdvzqeaniakyo.supabase.co"
key = ""
supabase = create_client(url, key)


def get_user_data(user_uuid):
    """
    Fetches both data and preferences for a specific ID.
    """
    try:
        response = supabase.table("user_data").select("*").execute()

        return response.data

    except Exception as e:
        print(f"Error: {e}")
        return None


target_uuid = "39908fca-7292-4ed3-b5c1-e9fecd28d33d"
user_info = get_user_data(target_uuid)
print(user_info)

