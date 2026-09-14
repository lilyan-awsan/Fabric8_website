#!/usr/bin/env python3
"""
Fabric8 Performance & Integrity Verification Guard
Ensures no external antivirus/adblocker code is accidentally injected,
validates HTML sizes, and checks edge caching headers.
"""
import os
import sys
import json
import glob

def check_html_files():
    print("--> Scanning HTML files for unexpected injections...")
    html_files = glob.glob("*.html")
    bad_signatures = [
        "kaspersky",
        "gc.kis.v2.scr",
        "abn_style",
        "adblock",
        "mcafee",
        "avast",
        "avg.com"
    ]
    
    has_issues = False
    for fpath in html_files:
        sz = os.path.getsize(fpath)
        with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read().lower()
            
        for sig in bad_signatures:
            if sig in content:
                print(f"  [ERROR] {fpath} contains suspicious signature: '{sig}'")
                has_issues = True
                
        if sz > 60 * 1024:
            print(f"  [WARN] {fpath} is unusually large ({sz // 1024} KB)")
        else:
            print(f"  [PASS] {fpath} ({sz // 1024} KB) - Clean")
            
    return not has_issues

def check_firebase_config():
    print("\n--> Checking firebase.json edge caching headers...")
    if not os.path.exists("firebase.json"):
        print("  [ERROR] firebase.json missing!")
        return False
        
    with open("firebase.json", "r", encoding="utf-8") as f:
        cfg = json.load(f)
        
    headers = cfg.get("hosting", {}).get("headers", [])
    has_asset_cache = any("/assets/**" in h.get("source", "") for h in headers)
    has_code_cache = any("@(css|js)" in h.get("source", "") or "css" in h.get("source", "") for h in headers)
    
    if has_asset_cache and has_code_cache:
        print("  [PASS] Edge caching rules configured for assets and scripts.")
        return True
    else:
        print("  [WARN] Edge caching rules incomplete in firebase.json.")
        return False

def main():
    print("========================================")
    print(" Fabric8 Performance Verification Guard ")
    print("========================================")
    
    html_ok = check_html_files()
    fb_ok = check_firebase_config()
    
    if html_ok and fb_ok:
        print("\nAll performance checks passed! Website is in high-performance state.")
        return 0
    else:
        print("\nPerformance verification encountered warnings or errors.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
