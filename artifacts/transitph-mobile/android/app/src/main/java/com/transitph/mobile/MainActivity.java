package com.transitph.mobile;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class MainActivity extends AppCompatActivity {
    private enum Screen {
        HOME, ROUTES, TERMINALS, SAVED, LOGIN
    }

    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private SessionStore sessionStore;
    private ApiClient apiClient;
    private FrameLayout contentContainer;
    private TextView navHome;
    private TextView navRoutes;
    private TextView navTerminals;
    private TextView navSaved;
    private Screen currentScreen = Screen.HOME;
    private String pendingFrom = "";
    private String pendingTo = "";
    private List<TerminalItem> terminals = new ArrayList<>();
    private List<RouteItem> routes = new ArrayList<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        sessionStore = new SessionStore(this);
        apiClient = new ApiClient(sessionStore);
        contentContainer = findViewById(R.id.content_container);
        navHome = findViewById(R.id.nav_home);
        navRoutes = findViewById(R.id.nav_routes);
        navTerminals = findViewById(R.id.nav_terminals);
        navSaved = findViewById(R.id.nav_saved);

        navHome.setOnClickListener(view -> showScreen(Screen.HOME));
        navRoutes.setOnClickListener(view -> showScreen(Screen.ROUTES));
        navTerminals.setOnClickListener(view -> showScreen(Screen.TERMINALS));
        navSaved.setOnClickListener(view -> showScreen(Screen.SAVED));
        findViewById(R.id.profile_button).setOnClickListener(view -> showProfile());

        showScreen(Screen.HOME);
    }

    private void showScreen(Screen screen) {
        currentScreen = screen;
        contentContainer.removeAllViews();
        View screenView;
        if (screen == Screen.HOME) {
            screenView = inflate(R.layout.screen_home);
            bindHome(screenView);
            updateBottomNavigation(navHome);
        } else if (screen == Screen.ROUTES) {
            screenView = inflate(R.layout.screen_routes);
            bindRoutes(screenView);
            updateBottomNavigation(navRoutes);
        } else if (screen == Screen.TERMINALS) {
            screenView = inflate(R.layout.screen_terminals);
            bindTerminals(screenView);
            updateBottomNavigation(navTerminals);
        } else if (screen == Screen.SAVED) {
            screenView = inflate(R.layout.screen_saved);
            bindSaved(screenView);
            updateBottomNavigation(navSaved);
        } else {
            screenView = inflate(R.layout.screen_login);
            bindLogin(screenView);
            clearBottomNavigation();
        }
        contentContainer.addView(screenView);
    }

    private View inflate(int layoutId) {
        return LayoutInflater.from(this).inflate(layoutId, contentContainer, false);
    }

    private void updateBottomNavigation(TextView active) {
        TextView[] items = {navHome, navRoutes, navTerminals, navSaved};
        for (TextView item : items) {
            item.setTextColor(ContextCompat.getColor(this, item == active ? R.color.brand_deep : R.color.brand_muted));
            item.setBackgroundColor(item == active ? ContextCompat.getColor(this, R.color.brand_sage) : ContextCompat.getColor(this, android.R.color.transparent));
        }
    }

    private void clearBottomNavigation() {
        TextView[] items = {navHome, navRoutes, navTerminals, navSaved};
        for (TextView item : items) {
            item.setTextColor(ContextCompat.getColor(this, R.color.brand_muted));
            item.setBackgroundColor(ContextCompat.getColor(this, android.R.color.transparent));
        }
    }

    private void bindHome(View root) {
        EditText from = root.findViewById(R.id.home_from);
        EditText to = root.findViewById(R.id.home_to);
        Button findRoute = root.findViewById(R.id.home_find_route);
        findRoute.setOnClickListener(view -> {
            pendingFrom = from.getText().toString().trim();
            pendingTo = to.getText().toString().trim();
            if (pendingFrom.isEmpty() || pendingTo.isEmpty()) {
                Toast.makeText(this, "Add a starting point and destination first.", Toast.LENGTH_SHORT).show();
                return;
            }
            showScreen(Screen.ROUTES);
        });
        root.findViewById(R.id.home_view_all).setOnClickListener(view -> showScreen(Screen.TERMINALS));

        LinearLayout terminalList = root.findViewById(R.id.home_terminal_list);
        showTerminals(terminalList, demoTerminals().subList(0, 3));
        loadTerminals(result -> {
            terminals = result;
            LinearLayout list = root.findViewById(R.id.home_terminal_list);
            showTerminals(list, result.subList(0, Math.min(3, result.size())));
        }, message -> {
            // The visible demo directory keeps the dashboard useful before an API URL is configured.
        });
        loadWeather(root);
    }

    private void loadWeather(View root) {
        TextView location = root.findViewById(R.id.home_weather_location);
        TextView temperature = root.findViewById(R.id.home_weather_temperature);
        TextView condition = root.findViewById(R.id.home_weather_condition);
        TextView note = root.findViewById(R.id.home_weather_note);
        apiClient.get("/weather?location=CALABARZON", new ApiClient.Callback() {
            @Override
            public void onSuccess(String body) {
                try {
                    JSONObject weather = new JSONObject(body);
                    mainHandler.post(() -> {
                        location.setText(weather.optString("location", "CALABARZON").toUpperCase(Locale.US));
                        temperature.setText(Math.round(weather.optDouble("temperature", 28)) + "°");
                        condition.setText(weather.optString("condition", "Partly cloudy"));
                        note.setText(weather.optString("warning", weather.optString("rainfallStatus", "Demo weather data")));
                    });
                } catch (Exception ignored) {
                    // Keep the XML demo weather state.
                }
            }

            @Override
            public void onError(String message) {
                // Keep the explicitly labeled demo weather state.
            }
        });
    }

    private void bindRoutes(View root) {
        EditText from = root.findViewById(R.id.routes_from);
        EditText to = root.findViewById(R.id.routes_to);
        from.setText(pendingFrom);
        to.setText(pendingTo);
        Button search = root.findViewById(R.id.routes_search);
        search.setOnClickListener(view -> {
            pendingFrom = from.getText().toString().trim();
            pendingTo = to.getText().toString().trim();
            if (pendingFrom.isEmpty() || pendingTo.isEmpty()) {
                Toast.makeText(this, "Add both places to search.", Toast.LENGTH_SHORT).show();
                return;
            }
            searchRoutes(root, pendingFrom, pendingTo);
        });
        if (!pendingFrom.isEmpty() && !pendingTo.isEmpty()) {
            searchRoutes(root, pendingFrom, pendingTo);
        }
    }

    private void searchRoutes(View root, String from, String to) {
        TextView summary = root.findViewById(R.id.routes_summary);
        LinearLayout list = root.findViewById(R.id.routes_list);
        summary.setText("Finding the best rides from " + from + " to " + to + "…");
        showRoutes(list, demoRoutes(), from, to);
        apiClient.get("/search?from=" + encode(from) + "&to=" + encode(to), new ApiClient.Callback() {
            @Override
            public void onSuccess(String body) {
                try {
                    List<RouteItem> parsed = parseRoutes(new JSONArray(body));
                    routes = parsed;
                    mainHandler.post(() -> {
                        summary.setText(parsed.size() + " route" + (parsed.size() == 1 ? "" : "s") + " from " + from + " to " + to);
                        showRoutes(list, parsed, from, to);
                    });
                } catch (Exception exception) {
                    mainHandler.post(() -> summary.setText("Showing route suggestions for " + from + " to " + to));
                }
            }

            @Override
            public void onError(String message) {
                mainHandler.post(() -> summary.setText("Showing demo suggestions. Connect the API for live route search."));
            }
        });
    }

    private void bindTerminals(View root) {
        EditText filter = root.findViewById(R.id.terminals_filter);
        LinearLayout list = root.findViewById(R.id.terminals_list);
        TextView mapLabel = root.findViewById(R.id.terminals_map_label);
        terminals = demoTerminals();
        showTerminals(list, terminals);
        mapLabel.setText("CALABARZON marker view\n" + terminals.size() + " terminals listed");
        filter.addTextChangedListener(new TextWatcher() {
            @Override public void beforeTextChanged(CharSequence text, int start, int count, int after) { }
            @Override public void onTextChanged(CharSequence text, int start, int before, int count) {
                showTerminals(list, filterTerminals(terminals, text.toString()));
            }
            @Override public void afterTextChanged(Editable editable) { }
        });
        loadTerminals(result -> {
            terminals = result;
            mapLabel.setText("CALABARZON marker view\n" + result.size() + " terminals listed");
            showTerminals(list, filterTerminals(result, filter.getText().toString()));
        }, message -> { });
    }

    private void bindSaved(View root) {
        TextView status = root.findViewById(R.id.saved_status);
        Button action = root.findViewById(R.id.saved_action);
        LinearLayout list = root.findViewById(R.id.saved_list);
        if (!sessionStore.isSignedIn()) {
            status.setText("Sign in to see private saved routes.");
            action.setText("Sign in  →");
            action.setOnClickListener(view -> showScreen(Screen.LOGIN));
            return;
        }

        status.setText("Saved trips for " + sessionStore.getName());
        action.setText("Find another route  →");
        action.setOnClickListener(view -> showScreen(Screen.ROUTES));
        apiClient.get("/saved-routes", new ApiClient.Callback() {
            @Override
            public void onSuccess(String body) {
                try {
                    List<RouteItem> saved = parseSavedRoutes(new JSONArray(body));
                    mainHandler.post(() -> showRoutes(list, saved, "", ""));
                } catch (Exception exception) {
                    mainHandler.post(() -> status.setText("Saved routes could not be read."));
                }
            }

            @Override
            public void onError(String message) {
                mainHandler.post(() -> status.setText("Saved routes are unavailable right now."));
            }
        });
    }

    private void bindLogin(View root) {
        EditText email = root.findViewById(R.id.login_email);
        EditText password = root.findViewById(R.id.login_password);
        Button submit = root.findViewById(R.id.login_submit);
        TextView message = root.findViewById(R.id.login_message);
        submit.setOnClickListener(view -> {
            String emailValue = email.getText().toString().trim();
            String passwordValue = password.getText().toString();
            if (emailValue.isEmpty() || passwordValue.isEmpty()) {
                message.setText("Enter your email and password.");
                return;
            }
            submit.setEnabled(false);
            message.setText("Signing you in…");
            JSONObject payload = new JSONObject();
            try {
                payload.put("email", emailValue);
                payload.put("password", passwordValue);
            } catch (Exception exception) {
                message.setText("Could not prepare the sign-in request.");
                submit.setEnabled(true);
                return;
            }
            apiClient.post("/auth/login", payload, new ApiClient.Callback() {
                @Override
                public void onSuccess(String body) {
                    try {
                        JSONObject response = new JSONObject(body);
                        JSONObject user = response.getJSONObject("user");
                        sessionStore.save(response.optString("sessionToken"), user.optString("name"), user.optString("email"));
                        mainHandler.post(() -> {
                            Toast.makeText(MainActivity.this, "Welcome back, " + user.optString("name") + ".", Toast.LENGTH_SHORT).show();
                            showScreen(Screen.HOME);
                        });
                    } catch (Exception exception) {
                        mainHandler.post(() -> {
                            submit.setEnabled(true);
                            message.setText("The sign-in response was not recognized.");
                        });
                    }
                }

                @Override
                public void onError(String error) {
                    mainHandler.post(() -> {
                        submit.setEnabled(true);
                        message.setText(error);
                    });
                }
            });
        });
    }

    private void showProfile() {
        if (!sessionStore.isSignedIn()) {
            showScreen(Screen.LOGIN);
            return;
        }
        new androidx.appcompat.app.AlertDialog.Builder(this)
                .setTitle(sessionStore.getName())
                .setMessage(sessionStore.getEmail() + "\n\nYour TransitPH commuter session is active.")
                .setPositiveButton("Sign out", (dialog, which) -> {
                    sessionStore.clear();
                    Toast.makeText(this, "You have been signed out.", Toast.LENGTH_SHORT).show();
                    showScreen(Screen.HOME);
                })
                .setNegativeButton("Close", null)
                .show();
    }

    private void loadTerminals(final TerminalCallback success, final ErrorCallback error) {
        apiClient.get("/terminals", new ApiClient.Callback() {
            @Override public void onSuccess(String body) {
                try {
                    List<TerminalItem> parsed = parseTerminals(new JSONArray(body));
                    mainHandler.post(() -> success.onResult(parsed));
                } catch (Exception exception) {
                    mainHandler.post(() -> error.onError("Could not read terminals."));
                }
            }
            @Override public void onError(String message) {
                mainHandler.post(() -> error.onError(message));
            }
        });
    }

    private void showTerminals(LinearLayout container, List<TerminalItem> items) {
        container.removeAllViews();
        if (items.isEmpty()) {
            TextView empty = new TextView(this);
            empty.setText("No matching terminals. Try a different city or province.");
            empty.setTextColor(ContextCompat.getColor(this, R.color.brand_muted));
            empty.setPadding(8, 24, 8, 24);
            container.addView(empty);
            return;
        }
        for (TerminalItem item : items) {
            View card = inflate(R.layout.item_terminal);
            ((TextView) card.findViewById(R.id.item_terminal_name)).setText(item.name);
            ((TextView) card.findViewById(R.id.item_terminal_city)).setText(item.city + ", " + item.province);
            ((TextView) card.findViewById(R.id.item_terminal_hours)).setText(item.hours);
            ((TextView) card.findViewById(R.id.item_terminal_routes)).setText(item.routeCount + " routes");
            container.addView(card);
        }
    }

    private void showRoutes(LinearLayout container, List<RouteItem> items, String from, String to) {
        container.removeAllViews();
        for (RouteItem item : items) {
            View card = inflate(R.layout.item_route);
            ((TextView) card.findViewById(R.id.item_route_name)).setText(item.routeName);
            ((TextView) card.findViewById(R.id.item_route_destination)).setText("To " + item.destination);
            ((TextView) card.findViewById(R.id.item_route_terminal)).setText(item.terminalName + " · " + item.city);
            ((TextView) card.findViewById(R.id.item_route_fare)).setText("Fare\n₱" + String.format(Locale.US, "%.2f", item.fare));
            ((TextView) card.findViewById(R.id.item_route_time)).setText("Ride\n" + item.travelTime);
            ((TextView) card.findViewById(R.id.item_route_walk)).setText("Walk\n" + item.walkingDistance);
            if (!from.isEmpty() && !to.isEmpty()) {
                card.setContentDescription(from + " to " + to + ", " + item.destination);
            }
            container.addView(card);
        }
    }

    private List<TerminalItem> filterTerminals(List<TerminalItem> source, String filter) {
        String normalized = filter.toLowerCase(Locale.US).trim();
        List<TerminalItem> result = new ArrayList<>();
        for (TerminalItem item : source) {
            if (normalized.isEmpty() || (item.name + " " + item.city + " " + item.province).toLowerCase(Locale.US).contains(normalized)) {
                result.add(item);
            }
        }
        return result;
    }

    private List<TerminalItem> parseTerminals(JSONArray array) {
        List<TerminalItem> result = new ArrayList<>();
        for (int i = 0; i < array.length(); i++) {
            JSONObject object = array.optJSONObject(i);
            if (object == null) continue;
            JSONArray routeArray = object.optJSONArray("routes");
            result.add(new TerminalItem(
                    object.optInt("id"),
                    object.optString("name", "Terminal"),
                    object.optString("city", "CALABARZON"),
                    object.optString("province", ""),
                    object.optString("operatingHours", "Hours vary"),
                    routeArray == null ? 0 : routeArray.length()
            ));
        }
        return result;
    }

    private List<RouteItem> parseRoutes(JSONArray array) {
        List<RouteItem> result = new ArrayList<>();
        for (int i = 0; i < array.length(); i++) {
            JSONObject object = array.optJSONObject(i);
            if (object != null) result.add(routeFromJson(object));
        }
        return result;
    }

    private List<RouteItem> parseSavedRoutes(JSONArray array) {
        List<RouteItem> result = new ArrayList<>();
        for (int i = 0; i < array.length(); i++) {
            JSONObject saved = array.optJSONObject(i);
            if (saved != null && saved.optJSONObject("route") != null) {
                result.add(routeFromJson(saved.optJSONObject("route")));
            }
        }
        return result;
    }

    private RouteItem routeFromJson(JSONObject object) {
        JSONObject terminal = object.optJSONObject("terminal");
        return new RouteItem(
                object.optInt("id"),
                object.optString("routeName", "Jeepney route"),
                object.optString("destination", "Destination"),
                terminal == null ? object.optString("terminalName", "Terminal") : terminal.optString("name", "Terminal"),
                terminal == null ? object.optString("city", "CALABARZON") : terminal.optString("city", "CALABARZON"),
                object.optDouble("fare", 0),
                object.optString("estimatedTravelTime", "Varies"),
                object.optString("walkingDistance", "Short walk")
        );
    }

    private List<TerminalItem> demoTerminals() {
        List<TerminalItem> result = new ArrayList<>();
        result.add(new TerminalItem(1, "Dasmariñas Bayan Terminal", "Dasmariñas", "Cavite", "05:00 – 22:00", 4));
        result.add(new TerminalItem(2, "Santa Rosa Balibago Complex", "Santa Rosa", "Laguna", "04:30 – 23:00", 6));
        result.add(new TerminalItem(3, "Calamba Crossing Terminal", "Calamba", "Laguna", "05:00 – 21:30", 5));
        result.add(new TerminalItem(4, "Batangas Grand Terminal", "Batangas City", "Batangas", "04:00 – 22:00", 8));
        return result;
    }

    private List<RouteItem> demoRoutes() {
        List<RouteItem> result = new ArrayList<>();
        result.add(new RouteItem(1, "Balibago – Nuvali", "Nuvali", "Santa Rosa Balibago Complex", "Santa Rosa", 18, "35 min", "650 m"));
        result.add(new RouteItem(2, "Cabuyao – Nuvali", "Nuvali", "Cabuyao Transport Hub", "Cabuyao", 15, "42 min", "420 m"));
        return result;
    }

    private String encode(String value) {
        return value.trim().replace(" ", "%20");
    }

    private interface TerminalCallback {
        void onResult(List<TerminalItem> result);
    }

    private interface ErrorCallback {
        void onError(String message);
    }

    private static class TerminalItem {
        final int id;
        final String name;
        final String city;
        final String province;
        final String hours;
        final int routeCount;

        TerminalItem(int id, String name, String city, String province, String hours, int routeCount) {
            this.id = id;
            this.name = name;
            this.city = city;
            this.province = province;
            this.hours = hours;
            this.routeCount = routeCount;
        }
    }

    private static class RouteItem {
        final int id;
        final String routeName;
        final String destination;
        final String terminalName;
        final String city;
        final double fare;
        final String travelTime;
        final String walkingDistance;

        RouteItem(int id, String routeName, String destination, String terminalName, String city, double fare, String travelTime, String walkingDistance) {
            this.id = id;
            this.routeName = routeName;
            this.destination = destination;
            this.terminalName = terminalName;
            this.city = city;
            this.fare = fare;
            this.travelTime = travelTime;
            this.walkingDistance = walkingDistance;
        }
    }
}