import requests
from datetime import datetime, timezone

def fetch_leetcode_stats(username: str):
    url = "https://leetcode.com/graphql"
    query = """
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        submitStats {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
      }
      recentSubmissionList(username: $username, limit: 20) {
        title
        titleSlug
        timestamp
        statusDisplay
      }
    }
    """
    variables = {"username": username}
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
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
        recent_submissions = data["data"].get("recentSubmissionList", []) or []
        
        # Calculate solved_today based on unique accepted problems solved today
        today_date = datetime.now(timezone.utc).date()
        today_solved_slugs = set()
        
        for sub in recent_submissions:
            if sub.get("statusDisplay") == "Accepted":
                try:
                    sub_time = datetime.fromtimestamp(int(sub.get("timestamp", 0)), tz=timezone.utc).date()
                    if sub_time == today_date:
                        today_solved_slugs.add(sub.get("titleSlug", sub.get("title")))
                except Exception:
                    pass
        
        result = {
            "total_solved": 0,
            "solved_today": len(today_solved_slugs),
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
