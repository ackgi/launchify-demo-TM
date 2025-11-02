//src\data\mockData.ts
import { MockData, User } from "@/types";

export const mockData: MockData = {
  users: [
    {
      id: "user-1",
      displayName: "Alice Johnson",
      avatar:
        "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150",
      role: "creator",
    },
    {
      id: "user-2",
      displayName: "Bob Smith",
      avatar:
        "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=150",
      role: "buyer",
    },
  ],
  
  products: [
    {
      id: "prod-1",
      name: "Weather Forecast API",
      description:
        "Get accurate, real-time weather data and forecasts for any location worldwide. Our API provides comprehensive meteorological information including current conditions, hourly forecasts, and extended 14-day predictions. Built for developers who need reliable weather data for their applications.",
      thumbnail:
        "https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=400",
      banner:
        "https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=800",
      docsUrl: "https://docs.weather-api.com",
      slug: "alice/weather-forecast",
      executionUrl: "https://api.weather-service.com",
      contentType: "application/json",
      status: "public",
      useCases: [
        "Travel & Tourism Apps",
        "Agriculture & Farming",
        "Logistics & Transportation",
        "Event Planning",
        "Smart Home Systems",
      ],
      sampleCode: `curl -X GET "https://api.weather-service.com/weather/current?lat=35.6762&lon=139.6503" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
      sampleResponse: `{
  "location": {
    "name": "Tokyo",
    "country": "Japan",
    "lat": 35.6762,
    "lon": 139.6503
  },
  "current": {
    "temperature": 22.5,
    "humidity": 65,
    "wind_speed": 3.2,
    "condition": "partly_cloudy",
    "visibility": 10
  }
}`,
      uptimePolicy: {
        alwaysUp: true,
        description: "99.9% uptime guarantee with 24/7 monitoring",
      },
      verification: {
        status: "success",
        lastChecked: "2025-01-11T10:30:00Z",
        uptime30d: "99.95%",
      },
      createdBy: "user-1",
    },
    {
      id: "prod-2",
      name: "Stock Market Data",
      description:
        "Access real-time stock prices, market data, and comprehensive financial analytics. Get live quotes, historical data, company fundamentals, and market indicators for global exchanges. Perfect for fintech applications, trading platforms, and investment tools.",
      thumbnail:
        "https://images.pexels.com/photos/159888/pexels-photo-159888.jpeg?auto=compress&cs=tinysrgb&w=400",
      banner:
        "https://images.pexels.com/photos/159888/pexels-photo-159888.jpeg?auto=compress&cs=tinysrgb&w=800",
      docsUrl: "https://docs.stockdata-api.com",
      slug: "alice/stock-market-data",
      executionUrl: "https://api.stockdata.com",
      contentType: "application/json",
      status: "public",
      useCases: [
        "Trading Platforms",
        "Investment Apps",
        "Financial Analytics",
        "Portfolio Management",
        "Market Research",
      ],
      sampleCode: `curl -X GET "https://api.stockdata.com/stock/quote?symbol=AAPL" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
      sampleResponse: `{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "price": 185.92,
  "change": 2.45,
  "change_percent": 1.34,
  "volume": 45678900,
  "market_cap": 2890000000000
}`,
      uptimePolicy: {
        alwaysUp: true,
        description: "Real-time updates during market hours",
      },
      verification: {
        status: "success",
        lastChecked: "2025-01-11T09:15:00Z",
        uptime30d: "99.87%",
      },
      createdBy: "user-1",
    },
  ],

  endpoints: [
    {
      id: "end-1",
      productId: "prod-1",
      groupId: "group-1",
      name: "Current Weather",
      method: "GET",
      path: "/weather/current",
      status: "public",
      description: "Get current weather conditions for any location",
      lastUpdated: "2025-01-10T14:00:00Z",
      isPrimary: true,
      sampleRequest: "GET /weather/current?lat=35.6762&lon=139.6503",
      sampleResponse:
        '{"temperature": 22.5, "humidity": 65, "condition": "partly_cloudy"}',
    },
    {
      id: "end-2",
      productId: "prod-1",
      groupId: "group-1",
      name: "7-Day Forecast",
      method: "GET",
      path: "/weather/forecast",
      status: "public",
      description: "Get detailed 7-day weather forecast with hourly data",
      lastUpdated: "2025-01-10T14:00:00Z",
      isPrimary: false,
      sampleRequest:
        "GET /weather/forecast?lat=35.6762&lon=139.6503&days=7",
      sampleResponse:
        '{"forecast": [{"date": "2025-01-11", "temperature": {"min": 18, "max": 25}}]}',
    },
    {
      id: "end-4",
      productId: "prod-1",
      groupId: "group-2",
      name: "Historical Weather",
      method: "GET",
      path: "/weather/history",
      status: "public",
      description: "Access historical weather data for any date range",
      lastUpdated: "2025-01-10T14:00:00Z",
      isPrimary: false,
      sampleRequest:
        "GET /weather/history?lat=35.6762&lon=139.6503&start=2025-01-01&end=2025-01-10",
      sampleResponse:
        '{"history": [{"date": "2025-01-01", "temperature": 20.1, "humidity": 70}]}',
    },
    {
      id: "end-3",
      productId: "prod-2",
      groupId: "group-3",
      name: "Stock Quote",
      method: "GET",
      path: "/stock/quote",
      status: "public",
      description: "Get real-time stock quotes and basic company information",
      lastUpdated: "2025-01-10T12:00:00Z",
      isPrimary: true,
      sampleRequest: "GET /stock/quote?symbol=AAPL",
      sampleResponse:
        '{"symbol": "AAPL", "price": 185.92, "change": 2.45, "change_percent": 1.34}',
    },
    {
      id: "end-5",
      productId: "prod-1",
      groupId: "group-1",
      name: "Weather Alerts",
      method: "GET",
      path: "/weather/alerts",
      status: "draft",
      description:
        "Get active weather alerts and warnings for a location",
      lastUpdated: "2025-01-11T09:00:00Z",
      isPrimary: false,
      sampleRequest: "GET /weather/alerts?lat=35.6762&lon=139.6503",
      sampleResponse:
        '{"alerts": [{"type": "storm_warning", "severity": "moderate", "description": "Thunderstorm expected"}]}',
    },
    {
      id: "end-6",
      productId: "prod-2",
      groupId: "group-3",
      name: "Market News",
      method: "GET",
      path: "/market/news",
      status: "public",
      description: "Get latest market news and analysis",
      lastUpdated: "2025-01-11T08:00:00Z",
      isPrimary: false,
      sampleRequest: "GET /market/news?category=stocks&limit=10",
      sampleResponse:
        '{"news": [{"title": "Market Update", "summary": "Stocks rise on positive earnings", "timestamp": "2025-01-11T08:00:00Z"}]}',
    },
  ],

  endpointGroups: [
    {
      id: "group-1",
      productId: "prod-1",
      name: "Light Weather APIs",
      description:
        "Real-time weather data and short-term forecasts with minimal processing overhead",
      category: "light",
      loadLevel: "low",
      useCases: ["Mobile apps", "Quick weather checks", "Simple dashboards"],
      endpointCount: 2,
      verification: {
        status: "success",
        lastChecked: "2025-01-11T10:30:00Z",
      },
      isDefault: true,
      downstreamCredential: {
        id: "cred-1",
        authKind: "bearer",
        inject: { header: "Authorization", scheme: "Bearer" },
        secretRef:
          "arn:aws:secretsmanager:us-east-1:123456789012:secret:weather-api-key",
        version: 1,
        status: "active",
      },
      planAccess: ["plan-1", "plan-2", "plan-4"],
    },
    {
      id: "group-2",
      productId: "prod-1",
      name: "Heavy Weather APIs",
      description:
        "Historical data analysis and high-precision forecasting with intensive processing",
      category: "heavy",
      loadLevel: "high",
      useCases: ["Climate research", "Agricultural planning", "Insurance analytics"],
      endpointCount: 1,
      verification: {
        status: "success",
        lastChecked: "2025-01-11T10:25:00Z",
      },
      isDefault: false,
      downstreamCredential: {
        id: "cred-2",
        authKind: "bearer",
        inject: { header: "Authorization", scheme: "Bearer" },
        secretRef:
          "arn:aws:secretsmanager:us-east-1:123456789012:secret:weather-heavy-key",
        version: 1,
        status: "active",
      },
      planAccess: ["plan-2", "plan-4"],
    },
    {
      id: "group-3",
      productId: "prod-2",
      name: "Market Data APIs",
      description:
        "Real-time stock quotes and market information for trading applications",
      category: "light",
      loadLevel: "medium",
      useCases: ["Trading platforms", "Portfolio tracking", "Market analysis"],
      endpointCount: 1,
      verification: {
        status: "success",
        lastChecked: "2025-01-11T09:15:00Z",
      },
      isDefault: true,
      downstreamCredential: {
        id: "cred-3",
        authKind: "header",
        inject: { header: "X-API-Key" },
        secretRef:
          "arn:aws:secretsmanager:us-east-1:123456789012:secret:stock-api-key",
        version: 1,
        status: "active",
      },
      planAccess: ["plan-3"],
    },
  ],

  plans: [
    {
      id: "plan-1",
      productId: "prod-1",
      name: "Basic",
      description: "Perfect for small applications and personal projects",
      price: 0,
      monthlyLimit: 10000,
      rateLimit: 60,
      status: "active",
      features: [
        "10,000 requests/month",
        "60 requests/minute",
        "Community support",
        "Basic documentation",
      ],
    },
    {
      id: "plan-2",
      productId: "prod-1",
      name: "Pro",
      description: "For growing businesses and production applications",
      price: 29,
      monthlyLimit: 100000,
      rateLimit: 300,
      status: "active",
      features: [
        "100,000 requests/month",
        "300 requests/minute",
        "Priority support",
        "99.9% SLA guarantee",
        "Advanced analytics",
      ],
    },
    {
      id: "plan-4",
      productId: "prod-1",
      name: "Enterprise",
      description: "For large-scale applications with custom requirements",
      price: 199,
      monthlyLimit: 1000000,
      rateLimit: 1000,
      status: "active",
      features: [
        "1,000,000 requests/month",
        "1,000 requests/minute",
        "Dedicated support",
        "99.99% SLA guarantee",
        "Custom integrations",
        "White-label options",
      ],
    },
    {
      id: "plan-3",
      productId: "prod-2",
      name: "Starter",
      description: "Real-time market data for individual traders",
      price: 49,
      monthlyLimit: 5000,
      rateLimit: 30,
      status: "active",
      features: [
        "5,000 requests/month",
        "30 requests/minute",
        "Real-time quotes",
        "Email support",
      ],
    },
  ],

  entitlements: [
    {
      id: "ent-1",
      userId: "user-2",
      productId: "prod-1",
      planId: "plan-1",
      status: "active",
      createdAt: "2025-01-05T10:00:00Z",
    },
    {
      id: "ent-2",
      userId: "user-2",
      productId: "prod-2",
      planId: "plan-3",
      status: "active",
      createdAt: "2025-01-08T14:30:00Z",
    },
  ],

  apiKeys: [
    {
      id: "key-1",
      entitlementId: "ent-1",
      name: "Master Key",
      keyPreview: "...a7b9",
      status: "active",
      lastUsed: "2025-01-11T08:30:00Z",
    },
    {
      id: "key-2",
      entitlementId: "ent-2",
      name: "Master Key",
      keyPreview: "...x3m8",
      status: "active",
      lastUsed: "2025-01-10T16:45:00Z",
    },
  ],

  verificationLogs: [
    {
      id: "log-1",
      productId: "prod-1",
      endpointId: "end-1",
      timestamp: "2025-01-11T10:30:00Z",
      result: "success",
      httpStatus: 200,
      responseTime: 145,
    },
    {
      id: "log-2",
      productId: "prod-2",
      endpointId: "end-3",
      timestamp: "2025-01-11T09:15:00Z",
      result: "success",
      httpStatus: 200,
      responseTime: 89,
    },
  ],
};

// ✅ 現在ログインしているユーザー（モック）
export const currentUser: { user: User | null } = {
  user: mockData.users[1], // Bob Smith (buyer)
};

// ✅ ユーザー切替
export const setCurrentUser = (user: User | null) => {
  currentUser.user = user;
};
