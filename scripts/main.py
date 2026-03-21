import pandas as pd
from supabase import create_client
from sklearn.ensemble import RandomForestClassifier

url = "https://euinlbrrdvzqeaniakyo.supabase.co"
key = ""
supabase = create_client(url, key)

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


target_user_id = "03ec4093-a950-48ea-a95e-7459b945aeda"
user_info = get_user_data(target_user_id)
print(user_info)

