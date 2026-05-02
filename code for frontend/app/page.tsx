"use client"

import { useState, useEffect } from "react"
import { MobileLayout } from "@/components/mobile-layout"
import { BottomNav } from "@/components/bottom-nav"
import { useAuth } from "@/context/AuthContext"
import { SplashScreen } from "@/components/screens/splash-screen"
import { PhoneAuthScreen } from "@/components/screens/phone-auth-screen"
import { CookOnboardingScreen } from "@/components/screens/cook-onboarding-screen"
import { UserOnboardingScreen } from "@/components/screens/user-onboarding-screen"
import { UserHomeScreen } from "@/components/screens/user-home-screen"
import { SubscriptionScreen } from "@/components/screens/subscription-screen"
import { CookProfileScreen } from "@/components/screens/cook-profile-screen"
import { OrderPlacementScreen } from "@/components/screens/order-placement-screen"
import { OrderWaitingScreen } from "@/components/screens/order-waiting-screen"
import { OrderConfirmedScreen } from "@/components/screens/order-confirmed-screen"
import { UserOrdersScreen } from "@/components/screens/user-orders-screen"
import { RatingScreen } from "@/components/screens/rating-screen"
import { CookDashboardScreen } from "@/components/screens/cook-dashboard-screen"
import { IncomingOrderScreen } from "@/components/screens/incoming-order-screen"
import { MealCreatorScreen } from "@/components/screens/meal-creator-screen"
import { AiSuggestionsScreen } from "@/components/screens/ai-suggestions-screen"
import { VoiceChatScreen } from "@/components/screens/voice-chat-screen"
import { NotificationsScreen } from "@/components/screens/notifications-screen"
import { UserProfileScreen } from "@/components/screens/user-profile-screen"
import { MapViewScreen } from "@/components/screens/map-view-screen"
import { LocationPickerScreen } from "@/components/screens/location-picker-screen"
import { PickupNavigationScreen } from "@/components/screens/pickup-navigation-screen"
import { LocationFilterSheet } from "@/components/location-filter-sheet"

type Screen = 
  | "splash"
  | "auth"
  | "cook-onboarding"
  | "user-onboarding"
  | "user-home"
  | "cook-profile"
  | "order-placement"
  | "order-waiting"
  | "order-confirmed"
  | "user-orders"
  | "rating"
  | "cook-dashboard"
  | "incoming-order"
  | "meal-creator"
  | "ai-suggestions"
  | "ai-insight"
  | "subscription"
  | "voice-chat"
  | "notifications"
  | "user-profile"
  | "map-view"
  | "location-picker"
  | "pickup-navigation"

type UserType = "user" | "cook"

export default function GharConnectApp() {
  const { user, logout: authLogout, loading: authLoading } = useAuth()
  const [screen, setScreen] = useState<Screen>("splash")
  const [userType, setUserType] = useState<UserType>("user")
  const [activeTab, setActiveTab] = useState("home")
  const [selectedCookId, setSelectedCookId] = useState<string | null>(null)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null)
  const [showFilterSheet, setShowFilterSheet] = useState(false)
  const [currentLocation, setCurrentLocation] = useState("Near You")

  // Auto-navigate based on auth state after hydration
  useEffect(() => {
    if (authLoading) return
    if (user) {
      const role = user.roles.includes("cook") ? "cook" : "user"
      setUserType(role)
      if (role === "cook") {
        setScreen("cook-dashboard")
        setActiveTab("dashboard")
      } else {
        setScreen("user-home")
        setActiveTab("home")
      }
    } else {
      setScreen("splash")
    }
  }, [user, authLoading])

  const handleUserSelect = () => {
    setUserType("user")
    setScreen("auth")
  }

  const handleCookSelect = () => {
    setUserType("cook")
    setScreen("auth")
  }

  const handleAuthVerified = () => {
    if (userType === "cook") {
      setScreen("cook-onboarding")
    } else {
      setScreen("user-onboarding")
    }
  }

  const handleUserOnboardingComplete = () => {
    setScreen("user-home")
    setActiveTab("home")
  }

  const handleCookOnboardingComplete = () => {
    setScreen("cook-dashboard")
    setActiveTab("dashboard")
  }

  const handleViewCook = (cookId: string) => {
    setSelectedCookId(cookId)
    setScreen("cook-profile")
  }

  const handleOrder = (slotId: string, mealId: string) => {
    setSelectedSlotId(slotId)
    setSelectedMealId(mealId)
    setScreen("order-placement")
  }

  const handlePlaceOrder = () => {
    setScreen("order-waiting")
  }

  const handleOrderConfirmed = () => {
    setScreen("order-confirmed")
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (userType === "user") {
      switch (tab) {
        case "home":
          setScreen("user-home")
          break
        case "ai-insight":
          setScreen("ai-insight")
          break
        case "orders":
          setScreen("user-orders")
          break
        case "subscription":
          setScreen("subscription")
          break
        case "profile":
          setScreen("user-profile")
          break
      }
    } else {
      switch (tab) {
        case "dashboard":
          setScreen("cook-dashboard")
          break
        case "ai-suggestions":
          setScreen("ai-suggestions")
          break
        case "orders":
          setScreen("user-orders")
          break
        case "profile":
          setScreen("user-profile")
          break
      }
    }
  }

  const handleLogout = () => {
    authLogout()
    setScreen("splash")
    setUserType("user")
    setActiveTab("home")
  }

  const showBottomNav = 
    screen === "user-home" || 
    screen === "user-orders" || 
    screen === "user-profile" ||
    screen === "cook-dashboard" ||
    screen === "ai-suggestions" ||
    screen === "ai-insight" ||
    screen === "subscription"

  const renderScreen = () => {
    switch (screen) {
      case "splash":
        return (
          <SplashScreen
            onUserSelect={handleUserSelect}
            onCookSelect={handleCookSelect}
          />
        )

      case "auth":
        return (
          <PhoneAuthScreen
            userType={userType}
            onBack={() => setScreen("splash")}
            onVerified={handleAuthVerified}
          />
        )

      case "cook-onboarding":
        return (
          <CookOnboardingScreen
            onBack={() => setScreen("auth")}
            onComplete={handleCookOnboardingComplete}
          />
        )

      case "user-onboarding":
        return (
          <UserOnboardingScreen
            onBack={() => setScreen("auth")}
            onComplete={handleUserOnboardingComplete}
          />
        )

      case "user-home":
        return (
          <UserHomeScreen
            onViewCook={handleViewCook}
            onOrder={(cookId) => {
              setSelectedCookId(cookId)
              setScreen("order-placement")
            }}
            onNotifications={() => setScreen("notifications")}
            onMapView={() => setScreen("map-view")}
            onLocationPicker={() => setScreen("location-picker")}
            currentLocation={currentLocation}
          />
        )

      case "cook-profile":
        return (
          <CookProfileScreen
            cookId={selectedCookId || ""}
            onBack={() => setScreen("user-home")}
            onOrder={(slotId, mealId) => {
              setSelectedSlotId(slotId)
              setSelectedMealId(mealId)
              setScreen("order-placement")
            }}
          />
        )

      case "order-placement":
        return (
          <OrderPlacementScreen
            cookId={selectedCookId || ""}
            slotId={selectedSlotId || ""}
            mealId={selectedMealId || ""}
            onBack={() => setScreen("cook-profile")}
            onPlaceOrder={(orderId) => {
              setSelectedOrderId(orderId)
              handlePlaceOrder()
            }}
          />
        )

      case "order-waiting":
        return (
          <OrderWaitingScreen
            orderId={selectedOrderId || ""}
            cookName="Your Cook"
            onTimeout={() => setScreen("user-home")}
            onConfirmed={handleOrderConfirmed}
          />
        )

      case "order-confirmed":
        return (
          <OrderConfirmedScreen
            onViewDetails={() => setScreen("user-orders")}
            onCall={() => {}}
            onVoiceMessage={() => setScreen("voice-chat")}
            onContinue={() => {
              setScreen("user-home")
              setActiveTab("home")
            }}
            onNavigate={() => setScreen("pickup-navigation")}
          />
        )

      case "user-orders":
        return (
          <UserOrdersScreen
            userType={userType}
            onOrderSelect={(orderId) => {
              setSelectedOrderId(orderId)
              setScreen("rating")
            }}
          />
        )

      case "ai-insight":
        return (
          <div className="flex flex-col items-center justify-center h-full bg-background px-4">
            <h1 className="text-2xl font-bold text-foreground">AI Insights</h1>
            <p className="text-muted-foreground text-center mt-2">Personalized food recommendations based on your preferences will appear here.</p>
          </div>
        )

      case "subscription":
        return <SubscriptionScreen />

      case "rating":
        return (
          <RatingScreen
            orderId={selectedOrderId || "1"}
            onBack={() => setScreen("user-orders")}
            onSubmit={() => setScreen("user-orders")}
          />
        )

      case "cook-dashboard":
        return (
          <CookDashboardScreen
            onIncomingOrder={() => setScreen("incoming-order")}
            onAiSuggestions={() => setScreen("ai-suggestions")}
            onEditMenu={() => setScreen("meal-creator")}
            onCreateMeal={() => setScreen("meal-creator")}
          />
        )

      case "incoming-order":
        return (
          <IncomingOrderScreen
            onAccept={() => setScreen("cook-dashboard")}
            onReject={() => setScreen("cook-dashboard")}
          />
        )

      case "meal-creator":
        return (
          <MealCreatorScreen
            onBack={() => setScreen("cook-dashboard")}
            onSave={() => setScreen("cook-dashboard")}
          />
        )

      case "ai-suggestions":
        return (
          <AiSuggestionsScreen
            onBack={() => setScreen("cook-dashboard")}
            onAddMeal={() => setScreen("meal-creator")}
          />
        )

      case "voice-chat":
        return (
          <VoiceChatScreen
            orderId="1234"
            cookName="Lakshmi Devi"
            onBack={() => setScreen("order-confirmed")}
            onCall={() => {}}
          />
        )

      case "notifications":
        return (
          <NotificationsScreen
            onBack={() => setScreen("user-home")}
            onNotificationClick={() => {}}
          />
        )

      case "user-profile":
        return (
          <UserProfileScreen
            onLogout={handleLogout}
          />
        )

      case "map-view":
        return (
          <MapViewScreen
            onBack={() => setScreen("user-home")}
            onCookSelect={(cookId) => {
              setSelectedCookId(cookId)
              setScreen("cook-profile")
            }}
            onFilter={() => setShowFilterSheet(true)}
          />
        )

      case "location-picker":
        return (
          <LocationPickerScreen
            onBack={() => setScreen("user-home")}
            onSelectLocation={(location) => {
              setCurrentLocation(location.name)
              setScreen("user-home")
            }}
          />
        )

      case "pickup-navigation":
        return (
          <PickupNavigationScreen
            orderId={selectedOrderId || "1234"}
            cookName="Lakshmi Devi"
            pickupTime="12:30 PM"
            onBack={() => setScreen("order-confirmed")}
            onCall={() => {}}
            onMessage={() => setScreen("voice-chat")}
            onArrived={() => setScreen("rating")}
          />
        )

      default:
        return null
    }
  }

  return (
    <MobileLayout showSafeArea={screen !== "splash" && screen !== "auth"}>
      {renderScreen()}
      {showBottomNav && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          variant={userType}
        />
      )}
      <LocationFilterSheet
        isOpen={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        onApply={(filters) => {
          console.log("Filters applied:", filters)
          setShowFilterSheet(false)
        }}
      />
    </MobileLayout>
  )
}
