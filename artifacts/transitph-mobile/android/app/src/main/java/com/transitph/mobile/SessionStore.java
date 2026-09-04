package com.transitph.mobile;

import android.content.Context;
import android.content.SharedPreferences;

public class SessionStore {
    private static final String PREFS = "transitph_session";
    private static final String TOKEN = "session_token";
    private static final String NAME = "user_name";
    private static final String EMAIL = "user_email";

    private final SharedPreferences preferences;

    public SessionStore(Context context) {
        preferences = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    public String getToken() {
        return preferences.getString(TOKEN, "");
    }

    public String getName() {
        return preferences.getString(NAME, "");
    }

    public String getEmail() {
        return preferences.getString(EMAIL, "");
    }

    public boolean isSignedIn() {
        return !getToken().isEmpty();
    }

    public void save(String token, String name, String email) {
        preferences.edit()
                .putString(TOKEN, token == null ? "" : token)
                .putString(NAME, name == null ? "" : name)
                .putString(EMAIL, email == null ? "" : email)
                .apply();
    }

    public void clear() {
        preferences.edit().clear().apply();
    }
}