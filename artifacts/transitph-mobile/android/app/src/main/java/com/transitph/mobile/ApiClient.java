package com.transitph.mobile;

import android.text.TextUtils;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

/**
 * Small dependency-free API client for the Java/XML Android version.
 *
 * Set TRANSITPH_API_BASE_URL in android/gradle.properties for a connected API,
 * for example:
 * TRANSITPH_API_BASE_URL=https://your-development-domain.example
 */
public class ApiClient {
    public interface Callback {
        void onSuccess(String body);
        void onError(String message);
    }

    private final SessionStore sessionStore;

    public ApiClient(SessionStore sessionStore) {
        this.sessionStore = sessionStore;
    }

    public void get(String path, Callback callback) {
        request("GET", path, null, callback);
    }

    public void post(String path, JSONObject body, Callback callback) {
        request("POST", path, body == null ? null : body.toString(), callback);
    }

    private void request(final String method, final String path, final String body, final Callback callback) {
        new Thread(() -> {
            HttpURLConnection connection = null;
            try {
                String baseUrl = BuildConfig.API_BASE_URL == null ? "" : BuildConfig.API_BASE_URL.trim();
                if (TextUtils.isEmpty(baseUrl)) {
                    throw new IllegalStateException("API base URL is not configured.");
                }
                baseUrl = baseUrl.replaceAll("/+$", "");
                if (!baseUrl.endsWith("/api")) {
                    baseUrl += "/api";
                }

                URL url = new URL(baseUrl + (path.startsWith("/") ? path : "/" + path));
                connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod(method);
                connection.setConnectTimeout(10000);
                connection.setReadTimeout(15000);
                connection.setRequestProperty("Accept", "application/json");
                String token = sessionStore.getToken();
                if (!TextUtils.isEmpty(token)) {
                    connection.setRequestProperty("Authorization", "Bearer " + token);
                }
                if (body != null) {
                    connection.setDoOutput(true);
                    connection.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
                    try (OutputStream output = connection.getOutputStream()) {
                        output.write(body.getBytes(StandardCharsets.UTF_8));
                    }
                }

                int status = connection.getResponseCode();
                InputStream stream = status >= 400 ? connection.getErrorStream() : connection.getInputStream();
                String response = readStream(stream);
                if (status >= 200 && status < 300) {
                    callback.onSuccess(response);
                } else {
                    String message = "Request failed (" + status + ").";
                    try {
                        JSONObject error = new JSONObject(response);
                        if (error.has("error")) {
                            message = error.optString("error", message);
                        }
                    } catch (Exception ignored) {
                        // Keep the useful HTTP status when the server does not return JSON.
                    }
                    callback.onError(message);
                }
            } catch (Exception exception) {
                callback.onError(exception.getMessage() == null ? "Could not reach the TransitPH API." : exception.getMessage());
            } finally {
                if (connection != null) {
                    connection.disconnect();
                }
            }
        }).start();
    }

    private String readStream(InputStream stream) throws Exception {
        if (stream == null) {
            return "";
        }
        StringBuilder builder = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                builder.append(line);
            }
        }
        return builder.toString();
    }
}