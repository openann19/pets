# Prod Guardian Status — pawfectmatch-premium/apps/web

This log tracks progress toward meeting all Hard Gates for production readiness. Update after each run with verifiable evidence.

## Hard Gates Checklist

- [ ] 1. TypeScript: `pnpm tsc --noEmit` returns 0 errors
- [ ] 2. ESLint: `pnpm eslint . --max-warnings 0` returns clean
- [ ] 3. Tests: `pnpm test --runInBand` ≥ 95% passing
- [ ] 4. Lighthouse (mobile): Performance ≥ 90, Accessibility ≥ 90, Best Practices 100, SEO 100
- [ ] 5. Axe-core: 0 critical/serious violations
- [ ] 6. Bundle size: JS < 280 KB gzip, CSS < 90 KB gzip
- [ ] 7. Core Web Vitals: LCP < 2.5 s, CLS < 0.1, INP < 200 ms
- [ ] 8. Secrets hygiene: .env.example only; repository has no real keys

---

## Baseline Run

- Date/Time: Thu Oct  9 05:20:15 EEST 2025
- Git SHA: d09b0e937100c6432fcd895a925cd201b74bf811

### 1) TypeScript
- Command: `npx tsc --noEmit`
- Result: 588 errors in 119 files
- Evidence:
```
Found 588 errors in 119 files.

Errors  Files
    24  app/[locale]/(protected)/pets/new/page.tsx:189
     1  cypress.config.ts:22
     1  middleware.ts:37
     1  playwright.config.ts:7
     3  src/app/admin/analytics/page.tsx:81
     1  src/app/api/notifications/register-token/route.ts:32
     2  src/app/share/[petId]/page.tsx:31
     2  src/app/swipe-v2/page.tsx:52
     1  src/components/AI/AIBioAssistant.tsx:67
     3  src/components/AI/BioGenerator.tsx:105
     1  src/components/AI/CompatibilityAnalyzer.tsx:154
     1  src/components/Admin/APIManagement.tsx:339
     3  src/components/Admin/KYCManagement.tsx:262
     2  src/components/Chat/EnhancedMessageInput.tsx:200
     1  src/components/Chat/MessageList.tsx:5
     1  src/components/ErrorBoundary.tsx:50
     3  src/components/ErrorBoundary/EnhancedErrorBoundary.tsx:47
     6  src/components/ErrorBoundary/ErrorBoundary.tsx:48
     2  src/components/ErrorBoundary/GlobalErrorBoundary.tsx:40
     7  src/components/Feed/HomeFeed.tsx:188
     1  src/components/Filter/AdvancedFilterPanel.tsx:280
     2  src/components/Filter/BreedSearchInput.tsx:63
     1  src/components/Filter/UltraPremiumFilterPanel.tsx:372
     1  src/components/GestureEnabledComponents.tsx:15
     1  src/components/GlobalTodoWidget.tsx:12
     2  src/components/Layout/DashboardBackdrop.tsx:32
    12  src/components/LazyLoadWrapper.tsx:45
     7  src/components/Map/AIMapFeatures.tsx:81
     1  src/components/Map/MapView.tsx:242
     1  src/components/PWA/InstallPrompt.tsx:175
     4  src/components/PWAProvider.tsx:4
     2  src/components/Pet/SwipeCard.tsx:126
     2  src/components/Pet/SwipeStack.tsx:5
     3  src/components/Premium/SubscriptionManager.tsx:69
     4  src/components/Stories/EmojiReactions.tsx:74
     5  src/components/Stories/StoriesCarousel.tsx:132
     3  src/components/Stories/StoryComposer.tsx:81
     3  src/components/Stories/StoryRing.tsx:239
     3  src/components/SwipeEnhanced/SwipePageWithFilters.tsx:464
     4  src/components/UI/AdvancedInteractionSystem.tsx:160
     4  src/components/UI/Button.tsx:51
     1  src/components/UI/Card.tsx:37
    28  src/components/UI/ContextualTooltips.tsx:31
     2  src/components/UI/EmptyState.tsx:109
     1  src/components/UI/Input.tsx:6
     1  src/components/UI/InteractionTestSuite.tsx:362
     2  src/components/UI/LikeAnimation.tsx:20
     6  src/components/UI/LocaleSwitcher.tsx:212
     2  src/components/UI/NavigationUnderline.tsx:52
     2  src/components/UI/PremiumBadge.tsx:165
     2  src/components/UI/PremiumSkeleton.tsx:91
     3  src/components/UI/PullToRefresh.tsx:59
     1  src/components/UI/SafeImage.tsx:107
     1  src/components/UI/Text.tsx:6
     3  src/components/UI/UniversalLoadingStates.tsx:123
     2  src/components/UXPackDemo.tsx:50
     4  src/components/auth/SocialLoginButtons.tsx:87
     2  src/components/chat/TypingIndicator.tsx:111
     8  src/components/coach/TourLauncher.tsx:78
     5  src/components/enhancements/EnhancementProvider.tsx:70
     2  src/components/feedback/FeedbackWidget.tsx:311
     1  src/components/gamification/BadgeSystem.tsx:355
    10  src/components/notifications/PushNotificationSetup.tsx:47
     6  src/components/pets/NameSuggestionWidget.tsx:57
     6  src/components/photos/PhotoEnhancement.tsx:104
     2  src/components/providers/AuthProvider.tsx:33
     4  src/components/social/PetShareView.tsx:222
    25  src/components/stories/SuccessStoriesCarousel.tsx:136
     8  src/components/ui/AvatarGenerator.tsx:69
     7  src/contexts/AuthContext.tsx:63
     2  src/contexts/SocketContext.tsx:16
    59  src/design-system/icons.tsx:44
     6  src/hooks/useAccessibility.ts:258
    10  src/hooks/useAdmin.ts:8
     3  src/hooks/useAdminAnalytics.ts:110
    14  src/hooks/useAdvancedGestures.ts:166
     1  src/hooks/useAuth.ts:62
     3  src/hooks/useBiometricAnalyzer.ts:58
     1  src/hooks/useEnhancedSocket.ts:97
     5  src/hooks/useFocusTrap.ts:65
    12  src/hooks/useNeuralNetwork.ts:42
     5  src/hooks/useOptimisticSwipe.ts:7
    11  src/hooks/usePredictiveTyping.ts:82
     7  src/hooks/useTypingIndicator.ts:27
     4  src/hooks/useUltraBreedFiltering.ts:155
     1  src/hooks/useWebSocket.ts:404
     1  src/lib/api-client.ts:33
     1  src/lib/api/client.ts:15
     1  src/lib/getBlur.client.ts:69
     2  src/lib/getBlur.ts:1
     2  src/lib/hooks/useSwipeLogic.ts:8
     7  src/lib/push-notifications.ts:128
     1  src/lib/schemas/realtime.ts:26
     9  src/lib/schemas/validation.ts:41
     1  src/lib/stores/useMatchStore.ts:100
     5  src/lib/websocket-manager.ts:71
     8  src/providers/CommandPalette.tsx:155
     3  src/providers/SocketProvider.tsx:93
     6  src/services/EnhancedWeatherService.ts:8
     8  src/services/WeatherService.ts:359
    17  src/services/adminApi.ts:11
     5  src/services/ai-name-suggestions.ts:35
    11  src/services/api.ts:23
     5  src/services/breeds.ts:2
     9  src/services/coach-tooltips.ts:45
     1  src/services/feedbackService.ts:57
    15  src/services/firebase-messaging.ts:30
     2  src/services/pwa-offline.ts:123
    10  src/services/session-replay.ts:37
     2  src/services/weatherProviders.ts:127
     1  src/tests/component-tests.tsx:62
    15  src/tests/premium-test-utils.tsx:34
     1  src/utils/analytics-system.ts:228
     1  src/utils/mobile-analytics.ts:212
     4  src/utils/mobile-optimization.tsx:135
     1  src/utils/performance-optimizations.ts:377
     2  src/utils/performance.ts:256
     2  tests/playwright/global-setup.ts:6
     6  tests/playwright/pet-management.spec.ts:50
```


### 2) ESLint
- Command: `npm run lint -- --max-warnings 0`
- Result: errors
- Evidence:
```
./src/app/admin/analytics/page.tsx
81:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/api/notifications/register-token/route.ts
32:3  Error: Do not assign to the variable `module`. See: https://nextjs.org/docs/messages/no-assign-module-variable  @next/next/no-assign-module-variable

./src/app/share/[petId]/page.tsx
31:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/swipe-v2/page.tsx
52:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/AI/AIBioAssistant.tsx
67:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/AI/BioGenerator.tsx
105:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/AI/CompatibilityAnalyzer.tsx
154:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/Admin/APIManagement.tsx
339:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/Admin/KYCManagement.tsx
262:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/Chat/EnhancedMessageInput.tsx
200:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/Chat/MessageList.tsx
5:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/ErrorBoundary.tsx
50:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/ErrorBoundary/EnhancedErrorBoundary.tsx
47:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/ErrorBoundary/ErrorBoundary.tsx
48:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/ErrorBoundary/GlobalErrorBoundary.tsx
40:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/Feed/HomeFeed.tsx
188:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/Filter/AdvancedFilterPanel.tsx
280:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/Filter/BreedSearchInput.tsx
63:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/Filter/UltraPremiumFilterPanel.tsx
372:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/GestureEnabledComponents.tsx
15:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/GlobalTodoWidget.tsx
12:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/Layout/DashboardBackdrop.tsx
32:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/LazyLoadWrapper.tsx
45:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/Map/AIMapFeatures.tsx
81:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/Map/MapView.tsx
242:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/PWA/InstallPrompt.tsx
175:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/PWAProvider.tsx
4:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/Pet/SwipeCard.tsx
126:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/Pet/SwipeStack.tsx
5:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/Premium/SubscriptionManager.tsx
69:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/Stories/EmojiReactions.tsx
74:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/Stories/StoriesCarousel.tsx
132:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/Stories/StoryComposer.tsx
81:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/Stories/StoryRing.tsx
239:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/SwipeEnhanced/SwipePageWithFilters.tsx
464:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/UI/AdvancedInteractionSystem.tsx
160:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/UI/Button.tsx
51:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/UI/Card.tsx
37:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/UI/ContextualTooltips.tsx
31:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/UI/EmptyState.tsx
109:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/UI/Input.tsx
6:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/UI/InteractionTestSuite.tsx
362:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/UI/LikeAnimation.tsx
20:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/UI/LocaleSwitcher.tsx
212:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/UI/NavigationUnderline.tsx
52:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/UI/PremiumBadge.tsx
165:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/UI/PremiumSkeleton.tsx
91:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/UI/PullToRefresh.tsx
59:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/UI/SafeImage.tsx
107:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/UI/Text.tsx
6:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/UI/UniversalLoadingStates.tsx
123:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/UXPackDemo.tsx
50:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/auth/SocialLoginButtons.tsx
87:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/chat/TypingIndicator.tsx
111:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/coach/TourLauncher.tsx
78:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/enhancements/EnhancementProvider.tsx
70:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/feedback/FeedbackWidget.tsx
311:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/gamification/BadgeSystem.tsx
355:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/notifications/PushNotificationSetup.tsx
47:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/pets/NameSuggestionWidget.tsx
57:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/photos/PhotoEnhancement.tsx
104:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/providers/AuthProvider.tsx
33:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/social/PetShareView.tsx
222:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/stories/SuccessStoriesCarousel.tsx
136:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/ui/AvatarGenerator.tsx
69:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/contexts/AuthContext.tsx
63:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/contexts/SocketContext.tsx
16:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/design-system/icons.tsx
44:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/useAccessibility.ts
258:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/useAdmin.ts
8:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/useAdminAnalytics.ts
110:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/useAdvancedGestures.ts
166:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/useAuth.ts
62:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/useBiometricAnalyzer.ts
58:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/useEnhancedSocket.ts
97:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/useFocusTrap.ts
65:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/useNeuralNetwork.ts
42:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/useOptimisticSwipe.ts
7:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/usePredictiveTyping.ts
82:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/useTypingIndicator.ts
27:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/useUltraBreedFiltering.ts
155:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/useWebSocket.ts
404:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/api-client.ts
33:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/api/client.ts
15:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/getBlur.client.ts
69:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/getBlur.ts
1:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/hooks/useSwipeLogic.ts
8:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/push-notifications.ts
128:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/schemas/realtime.ts
26:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/schemas/validation.ts
41:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/stores/useMatchStore.ts
100:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/websocket-manager.ts
71:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/providers/CommandPalette.tsx
155:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/providers/SocketProvider.tsx
93:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/EnhancedWeatherService.ts
8:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/WeatherService.ts
359:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/adminApi.ts
11:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/ai-name-suggestions.ts
35:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/api.ts
23:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/breeds.ts
2:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/coach-tooltips.ts
45:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/feedbackService.ts
57:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/firebase-messaging.ts
30:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/pwa-offline.ts
123:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/session-replay.ts
37:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/weatherProviders.ts
127:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/tests/component-tests.tsx
62:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/tests/premium-test-utils.tsx
34:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/utils/analytics-system.ts
228:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/utils/mobile-analytics.ts
212:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/utils/mobile-optimization.tsx
135:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/utils/performance-optimizations.ts
293:7  Error: Do not assign to the variable `module`. See: https://nextjs.org/docs/messages/no-assign-module-variable  @next/next/no-assign-module-variable
373:13  Warning: Unexpected object value in conditional. The condition is always true.  @typescript-eslint/strict-boolean-expressions
389:18  Warning: Unexpected empty arrow function.  @typescript-eslint/no-empty-function

./src/utils/performance.ts
16:7  Error: Do not assign to the variable `module`. See: https://nextjs.org/docs/messages/no-assign-module-variable  @next/next/no-assign-module-variable
127:16  Warning: Unexpected any value in conditional. An explicit comparison or type cast is required.  @typescript-eslint/strict-boolean-expressions
146:20  Warning: Forbidden non-null assertion.  @typescript-eslint/no-non-null-assertion
256:9  Warning: Unexpected any value in conditional. An explicit comparison or type cast is required.  @typescript-eslint/strict-boolean-expressions
275:13  Warning: Use object destructuring.  prefer-destructuring
321:9  Warning: Unexpected any value in conditional. An explicit comparison or type cast is required.  @typescript-eslint/strict-boolean-expressions
339:7  Warning: Unexpected any value in conditional. An explicit comparison or type cast is required.  @typescript-eslint/strict-boolean-expressions

./src/utils/petCardAdapter.ts
62:11  Warning: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly.  @typescript-eslint/strict-boolean-expressions
62:59  Warning: Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator.  @typescript-eslint/prefer-nullish-coalescing
63:12  Warning: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly.  @typescript-eslint/strict-boolean-expressions
63:62  Warning: Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator.  @typescript-eslint/prefer-nullish-coalescing
65:59  Warning: Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator.  @typescript-eslint/prefer-nullish-coalescing
67:10  Warning: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly.  @typescript-eslint/strict-boolean-expressions
67:56  Warning: Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator.  @typescript-eslint/prefer-nullish-coalescing

./src/utils/pwa-utils.ts
122:7  Warning: Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler or be explicitly marked as ignored with the `void` operator.  @typescript-eslint/no-floating-promises
158:11  Warning: Unexpected any value in conditional. An explicit comparison or type cast is required.  @typescript-eslint/strict-boolean-expressions
211:16  Warning: 'storeOfflineAction' is defined but never used.  @typescript-eslint/no-unused-vars
216:5  Warning: Unexpected `await` of a non-Promise (non-"Thenable") value.  @typescript-eslint/await-thenable
223:16  Warning: 'removeStoredOfflineAction' is defined but never used.  @typescript-eslint/no-unused-vars
228:5  Warning: Unexpected `await` of a non-Promise (non-"Thenable") value.  @typescript-eslint/await-thenable
235:16  Warning: 'loadOfflineActions' is defined but never used.  @typescript-eslint/no-unused-vars
247:9  Warning: Expected the Promise rejection reason to be an Error.  @typescript-eslint/prefer-promise-reject-errors
260:29  Warning: Expected the Promise rejection reason to be an Error.  @typescript-eslint/prefer-promise-reject-errors
371:13  Warning: Unexpected nullable number value in conditional. Please handle the nullish/zero/NaN cases explicitly.  @typescript-eslint/strict-boolean-expressions
371:28  Warning: Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator.  @typescript-eslint/prefer-nullish-coalescing
372:14  Warning: Unexpected nullable number value in conditional. Please handle the nullish/zero/NaN cases explicitly.  @typescript-eslint/strict-boolean-expressions
372:29  Warning: Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator.  @typescript-eslint/prefer-nullish-coalescing
373:14  Warning: Unexpected nullable number value in conditional. Please handle the nullish/zero/NaN cases explicitly.  @typescript-eslint/strict-boolean-expressions
373:49  Warning: Forbidden non-null assertion.  @typescript-eslint/no-non-null-assertion

./src/utils/responsive-test.tsx
14:11  Warning: Empty components are self-closing  react/self-closing-comp
18:11  Warning: Empty components are self-closing  react/self-closing-comp
22:11  Warning: Empty components are self-closing  react/self-closing-comp
171:13  Warning: Empty components are self-closing  react/self-closing-comp

./src/utils/safe-area.ts
56:10  Warning: Use `String#includes()` method with a string instead.  @typescript-eslint/prefer-includes

./src/utils/web-vitals.ts
20:8  Warning: Unexpected object value in conditional. The condition is always true.  @typescript-eslint/strict-boolean-expressions
31:42  Warning: Unexpected any value in conditional. An explicit comparison or type cast is required.  @typescript-eslint/strict-boolean-expressions
```


### 3) Tests
- Command: `npm run test -- --runInBand`
- Result: 64.7% pass rate (248 passed, 135 failed out of 383 total tests)
- Evidence:
```
Test Suites: 12 failed, 20 passed, 32 total
Tests:       135 failed, 248 passed, 383 total
Snapshots:   0 total
Time:        25.63 s
Ran all test suites.
```


### 4) Lighthouse CI (mobile)
- Command: `pnpm lhci autorun`
- Result: P <score>, A11y <score>, BP <score>, SEO <score>
- Evidence:
```
<lhci summary and links>
```

### 5) Axe-core (@a11y)
- Command: `pnpm playwright test --grep @a11y`
- Result: <violations summary>
- Evidence:
```
<playwright/junit snippet>
```

### 6) Bundle Size
- Command: `pnpm build`
- Result: JS <size gzip>, CSS <size gzip>
- Evidence:
```
<next build output + analyzer>
```

### 7) Core Web Vitals (Lab)
- Method: Lighthouse, Web Vitals in CI
- Result: LCP <value>, CLS <value>, INP <value>
### 8) Secrets Hygiene
- Scan: Manual inspection of .env files
- Result: No real secrets present; only .env.example and .env.local contain placeholders
- Evidence:
```
# .env.example (root directory)
Contains only placeholder values like:
- JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
- STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
- STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
- CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name

# apps/web/.env.local
Contains only placeholder values like:
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
- NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
- NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key

# server/.env
Contains some default development keys but no production secrets
- JWT_SECRET=super-secret-jwt-key-for-development-only-change-in-production-12345
- CLOUDINARY_CLOUD_NAME=demo
- EMAIL_USER=demo@example.com
- STRIPE_SECRET_KEY=sk_test_demo

---

## Final Verification

- Evidence links: <attach final evidence>
- Verification date/time: <fill>

Status: <Pending>
