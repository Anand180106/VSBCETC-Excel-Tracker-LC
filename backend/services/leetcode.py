import requests

def fetch_leetcode_stats(username: str):
    url = "https://leetcode.com/graphql"
    query = """
    query getUserProfile($username: String!) {
      allQuestionsCount {
        difficulty
        count
      }
      matchedUser(username: $username) {
        submitStats {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
      }
    }
    """
    variables = {"username": username}
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Referer": f"https://leetcode.com/{username}/"
    }
    try:
        response = requests.post(url, json={"query": query, "variables": variables}, headers=headers, timeout=10)
        if response.status_code != 200:
            print(f"Error fetching {username}: {response.status_code}")
            return None
            
        data = response.json()
        
        if "errors" in data or not data.get("data", {}).get("matchedUser"):
            return None
            
        stats = data["data"]["matchedUser"]["submitStats"]["acSubmissionNum"]
        
        result = {
            "total_solved": 0,
            "easy_solved": 0,
            "medium_solved": 0,
            "hard_solved": 0,
        }
        
        for item in stats:
            if item["difficulty"] == "All":
                result["total_solved"] = item["count"]
            elif item["difficulty"] == "Easy":
                result["easy_solved"] = item["count"]
            elif item["difficulty"] == "Medium":
                result["medium_solved"] = item["count"]
            elif item["difficulty"] == "Hard":
                result["hard_solved"] = item["count"]
                
        return result
    except Exception as e:
        print(f"Exception fetching {username}: {e}")
        return None
