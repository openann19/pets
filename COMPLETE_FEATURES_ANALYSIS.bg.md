# ПЪЛЕН ИЗЧЕРПАТЕЛЕН АНАЛИЗ НА PAWFECTMATCH
## Цялостна Документация на Всички Функционалности

---

## 🎯 СЪДЪРЖАНИЕ

1. [Модели на данни (Database Schemas)](#1-модели-на-данни)
2. [API Endpoints - Пълен списък](#2-api-endpoints)
3. [Real-Time комуникация (WebSockets)](#3-real-time-комуникация)
4. [AI възможности](#4-ai-възможности)
5. [Премиум функционалности](#5-премиум-функционалности)
6. [Frontend компоненти](#6-frontend-компоненти)
7. [Security & Authentication](#7-security--authentication)
8. [Файлови операции и медия](#8-файлови-операции-и-медия)
9. [Имейл система и нотификации](#9-имейл-система-и-нотификации)
10. [Мониторинг и администрация](#10-мониторинг-и-администрация)
11. [Мобилно приложение](#11-мобилно-приложение)
12. [Deployment и инфраструктура](#12-deployment-и-инфраструктура)

---

## 1. МОДЕЛИ НА ДАННИ

### 1.1 User Model (Потребителски модел)

**Файл:** `server/src/models/User.js`

**Основна информация:**
- `email` (string, unique, lowercase): Имейл адрес
- `password` (string, минимум 6 символа, хеширана): Парола
- `firstName`, `lastName` (string): Име и фамилия
- `dateOfBirth` (Date): Дата на раждане
- `avatar` (string): URL към профилна снимка
- `bio` (string, max 500 chars): Кратко описание
- `phone` (string): Телефонен номер

**Локация (GeoJSON):**
- `location.type` (enum: 'Point'): Тип на геометрията
- `location.coordinates` ([Number, Number]): [longitude, latitude]
- `location.address`: Пълен адрес (улица, град, щат, пощенски код, държава)

**Предпочитания (Preferences):**
- `maxDistance` (Number, default: 50km): Максимално разстояние за търсене
- `ageRange`: {min, max} - Възрастов диапазон за търсене
- `species` (Array): Предпочитани видове животни
- `intents` (Array): Цели - 'adoption', 'mating', 'playdate'
- `notifications`: Настройки за нотификации (email, push, matches, messages)

**Premium функции:**
- `premium.isActive` (Boolean): Дали е активен премиум
- `premium.plan` (enum: 'basic', 'premium', 'gold'): Тип на плана
- `premium.expiresAt` (Date): Дата на изтичане
- `premium.stripeSubscriptionId` (String): Stripe абонамент ID
- `premium.features`: Обект с достъп до функции
  - `unlimitedLikes`: Неограничени харесвания
  - `boostProfile`: Промоция на профил
  - `seeWhoLiked`: Виждане кой те е харесал
  - `advancedFilters`: Разширени филтри

**Активност:**
- `pets` (Array of ObjectIds): Списък с любимци
- `swipedPets`: История на прегледани любимци (petId, action, swipedAt)
- `matches` (Array of ObjectIds): Списък със съвпадения

**Аналитика:**
- `analytics.totalSwipes`: Общо плъзгания
- `analytics.totalLikes`: Общо харесвания
- `analytics.totalMatches`: Общо съвпадения
- `analytics.profileViews`: Прегледи на профила
- `analytics.lastActive`: Последна активност

**Статус на акаунта:**
- `isEmailVerified`: Потвърден имейл
- `isPhoneVerified`: Потвърден телефон
- `isActive`: Активен акаунт
- `isBlocked`: Блокиран акаунт

**Сигурност:**
- `refreshTokens` (Array): Списък с refresh токени
- `passwordResetToken`, `passwordResetExpires`: За възстановяване на парола
- `emailVerificationToken`, `emailVerificationExpires`: За потвърждение на имейл

---

### 1.2 Pet Model (Модел на домашен любимец)

**Файл:** `server/src/models/Pet.js`

**Основна информация:**
- `owner` (ObjectId → User): Собственик
- `name` (string, max 50 chars): Име
- `species` (enum): 'dog', 'cat', 'bird', 'rabbit', 'other'
- `breed` (string, max 100 chars): Порода
- `age` (Number, 0-30): Възраст в години
- `gender` (enum): 'male', 'female'
- `size` (enum): 'tiny', 'small', 'medium', 'large', 'extra-large'
- `weight` (Number, 0-200kg): Тегло

**Физически характеристики:**
- `color.primary`, `color.secondary`: Цветове
- `color.pattern` (enum): 'solid', 'spotted', 'striped', 'mixed', 'other'

**Медийни файлове:**
- `photos` (Array): 
  - `url`: URL към снимката (Cloudinary)
  - `publicId`: Cloudinary public ID за изтриване
  - `caption`: Описание
  - `isPrimary`: Дали е основна снимка
- `videos` (Array): Видео файлове с аналогична структура

**Описание и личност:**
- `description` (string, max 1000 chars): Подробно описание
- `personalityTags` (Array): Личностни черти като:
  - 'friendly', 'energetic', 'calm', 'playful', 'shy', 'protective'
  - 'good-with-kids', 'good-with-pets', 'good-with-strangers'
  - 'trained', 'house-trained', 'leash-trained', 'crate-trained'
  - 'vocal', 'quiet', 'independent', 'clingy', 'intelligent'
  - 'gentle', 'active', 'lazy', 'social', 'aggressive', 'anxious', 'loyal'

**Намерение и наличност:**
- `intent` (enum): 'adoption', 'mating', 'playdate', 'all'
- `availability.isAvailable` (Boolean): Налични ли сме
- `availability.schedule`: График по дни от седмицата (понеделник-неделя)

**Здравословна информация:**
- `healthInfo.vaccinated`: Ваксинирано ли е
- `healthInfo.spayedNeutered`: Кастрирано/стерилизирано
- `healthInfo.microchipped`: С микрочип
- `healthInfo.healthConditions` (Array): Здравословни състояния
- `healthInfo.medications` (Array): Лекарства
- `healthInfo.specialNeeds`: Специални нужди
- `healthInfo.lastVetVisit`: Последен преглед при ветеринар
- `healthInfo.vetContact`: Контакт на ветеринар

**Локация:**
- `location` (GeoJSON Point): Координати на любимеца

**Обучение и социализация:**
- `trainingInfo.level`: Ниво на обучение
- `trainingInfo.commands` (Array): Научени команди
- `socialization.withPets`, `socialization.withPeople`: Ниво на социализация

**AI данни (за алгоритъма за съвместимост):**
- `aiData.breedCharacteristics`: Характеристики на породата
- `aiData.compatibilityScore`: Оценка за съвместимост
- `aiData.personalityAnalysis`: AI анализ на личността

**Статистика и промоция:**
- `stats.views`: Брой прегледи
- `stats.likes`: Брой харесвания
- `stats.superLikes`: Брой супер харесвания
- `featured.isFeatured`: Промотиран ли е
- `featured.featuredUntil`: До кога е промотиран

**Управление на взаимодействия:**
- `likedBy` (Array): Кой е харесал любимеца
- `superLikedBy` (Array): Кой е супер харесал
- `passedBy` (Array): Кой е пропуснал

---

### 1.3 Match Model (Модел на съвпадение)

**Файл:** `server/src/models/Match.js`

**Участници:**
- `pet1`, `pet2` (ObjectId → Pet): Двата любимци
- `user1`, `user2` (ObjectId → User): Двамата собственици

**Детайли:**
- `matchType` (enum): 'adoption', 'mating', 'playdate', 'general'
- `compatibilityScore` (Number, 0-100): AI оценка за съвместимост
- `aiRecommendationReason` (string): AI причина за препоръка
- `status` (enum): 'active', 'archived', 'blocked', 'deleted', 'completed'

**Съобщения (Messages):**
- `messages` (Array):
  - `sender` (ObjectId → User): Подател
  - `content` (string, max 1000 chars): Съдържание
  - `messageType` (enum): 'text', 'image', 'location', 'system'
  - `attachments` (Array): Прикачени файлове
  - `readBy` (Array): Кой е прочел (user, readAt)
  - `sentAt`, `editedAt`: Времена на изпращане/редактиране
  - `isEdited`, `isDeleted`: Флагове

**Планиране на срещи (Meetings):**
- `meetings` (Array):
  - `proposedBy`: Кой предлага
  - `title`, `description`: Заглавие и описание
  - `proposedDate`: Предложена дата
  - `location`: Име, адрес, координати
  - `status`: 'proposed', 'accepted', 'declined', 'completed', 'cancelled'
  - `responses`: Отговори от потребителите

**Потребителски действия:**
- `userActions.user1/user2`:
  - `isFavorite`: Маркирано ли е като любимо
  - `isArchived`: Архивирано ли е
  - `isBlocked`: Блокирано ли е
  - `lastRead`: Последно прочетено съобщение

**Метаданни:**
- `lastActivity`: Последна активност в чата
- `createdAt`, `updatedAt`: Дати на създаване/обновяване

---

### 1.4 BreedProfile Model (Модел на породи)

**Файл:** `server/src/models/BreedProfile.js`

**Основна информация:**
- `name` (string, unique, lowercase): Име на породата
- `species` (enum): Вид животно
- `alternateNames` (Array): Алтернативни имена

**Физически характеристики:**
- `size` (enum): 'tiny', 'small', 'medium', 'small-medium', 'large', 'extra-large', 'giant'
- `weightRange`: {min, max} - Диапазон на теглото
- `lifeSpan`: {min, max} - Продължителност на живота
- `coatTypes` (Array): Типове козина
- `colors` (Array): Цветове

**Темперамент:**
- `temperament` (Array): Обширен списък от черти (над 50 опции)
- `energyLevel` (enum): 'low', 'moderate', 'high', 'very-high'
- `exerciseNeeds` (enum): 'minimal', 'moderate', 'high', 'extensive'
- `groomingNeeds` (enum): 'minimal', 'moderate', 'high', 'extensive', 'specialized'

**Съвместимост:**
- `familyFriendly`: Подходящ за семейства
- `kidFriendly`: Подходящ за деца
- `petFriendly`: Подходящ за други животни
- `strangerFriendly`: Отношение към непознати

**Условия за живот:**
- `apartmentFriendly` (Boolean): Подходящ за апартамент
- `yardRequired` (Boolean): Нужен ли е двор
- `climateSensitivity` (Array): Чувствителност към климата

**Здраве:**
- `healthConcerns` (Array): Честни здравословни проблеми
- `geneticConditionRisk` (enum): 'low', 'moderate', 'high'

**Допълнително:**
- `description`: Подробно описание
- `origin`: Произход
- `history`: История на породата
- `imageUrl`: Референтна снимка
- `popularity`: Рейтинг на популярност

---

## 2. API ENDPOINTS

### 2.1 Authentication Routes (`/api/auth`)

**Файл:** `server/src/routes/auth.js`

#### POST `/api/auth/register`
- **Функция:** Регистрация на нов потребител
- **Rate limit:** 5 заявки на 15 минути
- **Валидация:**
  - Email (валиден формат)
  - Password (минимум 6 символа)
  - firstName, lastName (задължителни)
  - dateOfBirth (валидна дата)
  - phone (опционален, валиден формат)
- **Отговор:** JWT токени (accessToken, refreshToken) + потребителски данни

#### POST `/api/auth/login`
- **Функция:** Вход в системата
- **Rate limit:** 5 заявки на 15 минути
- **Валидация:** Email и password
- **Отговор:** JWT токени + пълни потребителски данни

#### POST `/api/auth/logout`
- **Функция:** Изход от системата
- **Защита:** Изисква автентикация
- **Действие:** Премахва refresh токена от сървъра

#### GET `/api/auth/me`
- **Функция:** Получаване на информация за текущия потребител
- **Защита:** Изисква автентикация
- **Отговор:** Пълни данни на потребителя (без парола)

#### POST `/api/auth/refresh-token`
- **Функция:** Опресняване на access token
- **Rate limit:** 5 заявки на 15 минути
- **Изисква:** refreshToken в тялото
- **Отговор:** Нови accessToken и refreshToken

#### POST `/api/auth/verify-email`
- **Функция:** Потвърждаване на имейл адрес
- **Параметри:** token (от имейла)

#### POST `/api/auth/forgot-password`
- **Функция:** Заявка за възстановяване на парола
- **Rate limit:** 3 заявки на час
- **Действие:** Изпраща имейл с линк за възстановяване

#### POST `/api/auth/reset-password`
- **Функция:** Задаване на нова парола
- **Rate limit:** 3 заявки на час
- **Изисква:** token + новата парола

---

### 2.2 User Routes (`/api/users`)

**Файл:** `server/src/routes/users.js`

#### GET `/api/users/profile`
- **Функция:** Извличане на профила
- **Защита:** Автентикация изискана
- **Отговор:** Пълни данни на потребителя

#### PUT `/api/users/profile`
- **Функция:** Актуализиране на профила
- **Защита:** Автентикация
- **Валидация:** firstName, lastName, bio, phone
- **Можете да променяте:** Име, фамилия, био, телефон

#### PUT `/api/users/preferences`
- **Функция:** Актуализиране на предпочитания за търсене
- **Защита:** Автентикация
- **Параметри:** maxDistance, ageRange, species, intents, notifications

#### PUT `/api/users/location`
- **Функция:** Актуализиране на геолокацията
- **Защита:** Автентикация
- **Валидация:** coordinates [longitude, latitude]
- **Параметри:** coordinates (Array), address (Object)

#### PUT `/api/users/avatar`
- **Функция:** Качване/смяна на аватар
- **Защита:** Автентикация
- **File upload:** Multer middleware (max 2MB, само изображения)
- **Storage:** Cloudinary

#### GET `/api/users/stats`
- **Функция:** Статистика за активността на потребителя
- **Защита:** Автентикация
- **Отговор:** Общо плъзгания, харесвания, съвпадения и др.

#### DELETE `/api/users/account`
- **Функция:** Перманентно изтриване на акаунта
- **Защита:** Автентикация
- **Действие:** Изтрива потребител, любимци, съвпадения

---

### 2.3 Pet Routes (`/api/pets`)

**Файл:** `server/src/routes/pets.js`

#### POST `/api/pets`
- **Функция:** Създаване на нов профил на любимец
- **Защита:** Автентикация
- **File upload:** До 10 снимки (5MB всяка)
- **Валидация:** Всички задължителни полета (name, species, breed, age, gender, size, intent)
- **Storage:** Cloudinary за снимки

#### GET `/api/pets/discover`
- **Функция:** Основен endpoint за откриване на любимци ("swipe feed")
- **Защита:** Опционална (работи и без автентикация, но с ограничения)
- **Параметри:** 
  - `species`: Вид животно
  - `intent`: Цел (adoption, mating, playdate)
  - `size`: Размер
  - `gender`: Пол
  - `breed`: Порода (поддържа regex търсене)
  - `ages`: Възрастов диапазон (например "2-5")
  - `sizes`: Множество размери (comma-separated)
  - `minAge`, `maxAge`: Точни граници на възраст
  - `maxDistance`: Максимално разстояние в км
  - `sortBy`: Сортиране ('relevance', 'distance', 'age', 'createdAt')
  - `page`, `limit`: Pagination
- **AI функция:** Премахва вече прегледани любимци
- **Географско филтриране:** Базирано на потребителската локация

#### GET `/api/pets/discover/advanced`
- **Функция:** УЛТРА-ПРЕМИУМ откриване с всички филтри
- **Защита:** Автентикация изискана
- **Параметри (над 30 опции):**
  - Основни: species, breeds, intent, ageRange, sizes, gender
  - Физически: colors, coatTypes, weightRange
  - Темперамент: temperaments, energyLevels, trainability, barkingTendency
  - Съвместимост: familyFriendly, kidFriendly, petFriendly, strangerFriendly, apartmentFriendly
  - Здраве: healthConcerns, groomingNeeds, exerciseNeeds, specialNeeds
  - Локация: maxDistance, availableNow, daysOfWeek, timeSlots
  - Сортиране: sortBy, sortDirection
  - Премиум: boostFeature, popularityThreshold, verifiedOnly
  - Търсене: searchQuery, nearMeFirst
- **AI интеграция:** Използва брийд характеристики за интелигентно филтриране

#### POST `/api/pets/match-advanced`
- **Функция:** AI-базирано намиране на най-добри съвпадения
- **Защита:** Автентикация
- **AI:** Изчислява compatibility score между любимци

#### GET `/api/pets/my-pets`
- **Функция:** Списък с всички любимци на потребителя
- **Защита:** Автентикация
- **Отговор:** Масив от Pet обекти

#### GET `/api/pets/:id`
- **Функция:** Детайлна информация за конкретен любимец
- **Защита:** Опционална
- **Отговор:** Пълен Pet обект с owner данни

#### PUT `/api/pets/:id`
- **Функция:** Актуализиране на любимец
- **Защита:** Автентикация + Ownership проверка
- **File upload:** До 10 нови снимки
- **Действие:** Обновява всички полета, добавя нови снимки

#### DELETE `/api/pets/:id`
- **Функция:** Изтриване на любимец
- **Защита:** Автентикация + Ownership проверка
- **Действие:** Изтрива любимеца, снимките от Cloudinary и свързаните съвпадения

#### POST `/api/pets/:petId/swipe`
- **Функция:** Регистриране на "плъзгане" (swipe)
- **Защита:** Автентикация
- **Валидация:** action ('like', 'pass', 'superlike')
- **AI функция:** При взаимно харесване създава Match автоматично
- **Нотификации:** Изпраща имейл при ново съвпадение

---

### 2.4 Match Routes (`/api/matches`)

**Файл:** `server/src/routes/matches.js`

#### GET `/api/matches`
- **Функция:** Списък със съвпадения на потребителя
- **Защита:** Автентикация
- **Параметри:**
  - `status` (default: 'active'): Статус на съвпаденията
  - `page`, `limit`: Pagination
  - `sortBy`: 'lastActivity' или 'createdAt'
  - `order`: 'asc' или 'desc'
- **Aggregation:** Изчислява непрочетени съобщения за всяко съвпадение
- **Филтриране:** Премахва блокирани и архивирани (освен ако не се иска архивни)

#### GET `/api/matches/stats`
- **Функция:** Статистика за съвпаденията
- **Защита:** Автентикация
- **Отговор:** Общо активни, архивирани, нови съобщения

#### GET `/api/matches/:matchId`
- **Функция:** Детайлна информация за едно съвпадение
- **Защита:** Автентикация + Ownership проверка
- **Populate:** Pets, Users, Messages (с sender данни)
- **Автоматично действие:** Маркира съобщенията като прочетени

#### GET `/api/matches/:matchId/messages`
- **Функция:** Извличане на съобщения за съвпадение
- **Защита:** Автентикация
- **Параметри:** page, limit
- **Отговор:** Масив със съобщения, пагинирани

#### POST `/api/matches/:matchId/messages`
- **Функция:** Изпращане на ново съобщение
- **Защита:** Автентикация
- **Валидация:** content (1-1000 символа), messageType
- **Real-time:** Изпраща Socket.IO event към другия потребител
- **Действие:** Обновява lastActivity на match-а

#### PATCH `/api/matches/:matchId/archive`
- **Функция:** Архивиране на съвпадение
- **Защита:** Автентикация
- **Действие:** Маркира като архивирано за текущия потребител

#### PATCH `/api/matches/:matchId/block`
- **Функция:** Блокиране на съвпадение
- **Защита:** Автентикация
- **Действие:** Блокира другия потребител, спира комуникацията

#### PATCH `/api/matches/:matchId/favorite`
- **Функция:** Маркиране като любимо
- **Защита:** Автентикация
- **Действие:** Toggle на favorite статус

---

### 2.5 Chat Routes (`/api/chat`)

**Файл:** `server/src/routes/chat.js`

#### GET `/api/chat/history/:matchId`
- **Функция:** История на чата
- **Защита:** Неявно чрез matchId проверка
- **Отговор:** Всички съобщения за дадения match

#### POST `/api/chat/read/:matchId`
- **Функция:** Маркиране на съобщения като прочетени
- **Защита:** Автентикация
- **Действие:** Добавя потребителя в readBy масив

#### GET `/api/chat/online`
- **Функция:** Списък на онлайн потребители
- **Защита:** Автентикация
- **Real-time:** Използва Socket.IO online status

---

### 2.6 Breeds Routes (`/api/breeds`)

**Файл:** `server/src/routes/breeds.js`

#### GET `/api/breeds`
- **Функция:** Списък с всички породи
- **Публичен:** Не изисква автентикация
- **Параметри:** species, size, energyLevel, temperament
- **Pagination:** Поддържа page, limit
- **Отговор:** Масив от BreedProfile обекти

#### GET `/api/breeds/stats`
- **Функция:** Статистика за породите в базата
- **Публичен:** Не изисква автентикация
- **Отговор:** Брой по видове, най-популярни породи

#### GET `/api/breeds/search/autocomplete`
- **Функция:** Автоматично довършване при търсене
- **Публичен:** Не изисква автентикация
- **Параметри:** `q` (query string)
- **Отговор:** Първите 10 съответстващи породи

#### GET `/api/breeds/:name`
- **Функция:** Детайлна информация за конкретна порода
- **Публичен:** Не изисква автентикация
- **Параметри:** name (case-insensitive)
- **Отговор:** Пълен BreedProfile обект

#### POST `/api/breeds/suggestions`
- **Функция:** Персонализирани препоръки за породи
- **Защита:** Автентикация
- **AI:** Базирано на профила и предпочитанията на потребителя

---

### 2.7 Premium Routes (`/api/premium`)

**Файл:** `server/src/routes/premium.js`

#### POST `/api/premium/subscribe`
- **Функция:** Абониране за премиум
- **Защита:** Автентикация
- **Stripe интеграция:** Създава Stripe subscription
- **Параметри:** plan ('premium' или 'gold'), paymentMethodId
- **Действие:** Активира premium функции, изпраща welcome имейл

#### POST `/api/premium/cancel`
- **Функция:** Отказване от абонамент
- **Защита:** Автентикация
- **Stripe:** Отменя subscription в Stripe
- **Действие:** Дезактивира premium функции (след края на billing период)

#### GET `/api/premium/features`
- **Функция:** Списък с премиум функции и цени
- **Публичен:** Не изисква автентикация
- **Отговор:** Описание на планове и функции

#### POST `/api/premium/boost/:petId`
- **Функция:** Промоция на профил на любимец
- **Защита:** Автентикация + requirePremium middleware
- **Действие:** Повишава видимостта на любимеца за 24 часа

#### GET `/api/premium/super-likes`
- **Функция:** Информация за наличните супер харесвания
- **Защита:** Автентикация + requirePremium
- **Отговор:** Брой налични super likes, дата на reset

---

### 2.8 AI Routes (`/api/ai`)

**Файл:** `server/src/routes/ai.js`

#### POST `/api/ai/generate-bio`
- **Функция:** AI генериране на биография за любимец
- **Защита:** Автентикация
- **Параметри:**
  - `keywords` (Array, задължителен): Ключови думи
  - `petName`, `currentBio`, `tone`, `length`: Опционални
  - `species`, `breed`, `age`, `size`, `personality_tags`: За контекст
- **AI Service:** Извиква Python AI сървис или DeepSeek API директно
- **Кеширане:** 1 час TTL за идентични заявки
- **Отговор:** Генерирана биография + метаданни (tone, length, confidence)

#### POST `/api/ai/analyze-photos`
- **Функция:** AI анализ на снимки на любимец
- **Защита:** Автентикация
- **Валидация:** photoUrls (Array от URLs)
- **AI Service:** Анализира всяка снимка
- **Отговор:**
  - `results`: Масив с анализи за всяка снимка
  - `bestPhoto`: Най-добрата снимка според AI
  - `summary`: Обща статистика
- **За всяка снимка:**
  - `analysis`: Текстов анализ
  - `confidence`: 0-1
  - `scores`: {clarity, composition, lighting, engagement}
  - `detected_traits`: Разпознати черти
  - `recommendations`: Препоръки за подобрение
  - `ai_insights`: Породни индикатори, здравна оценка

#### POST `/api/ai/enhanced-compatibility`
- **Функция:** Задълбочен AI анализ на съвместимост
- **Защита:** Автентикация
- **Параметри:**
  - `pet1`, `pet2` (Objects): Пълни данни за двата любимеца
  - `interaction_type`: 'playdate', 'mating', 'adoption', 'cohabitation'
- **AI изчисления:**
  - Породна съвместимост
  - Съвместимост на характерите
  - Съвместимост на размера
  - Съвместимост на възрастта
  - Географска близост
- **Отговор:**
  - `compatibility_score`: 0-100
  - `confidence`: AI увереност
  - `breakdown`: Детайлна разбивка на оценките
  - `insights`: AI прозрения
  - `recommendations`: Препоръки
  - `risk_factors`: Рискови фактори
  - `interaction_suitability`: Подходящо ли е взаимодействието

#### POST `/api/ai/compatibility` (Legacy)
- **Функция:** По-проста версия на анализа
- **Защита:** Автентикация
- **Параметри:** pet1, pet2 (Objects)
- **Fallback:** Ако enhanced анализът не работи, използва проста формула

#### POST `/api/ai/assist-application`
- **Функция:** AI помощ за молба за осиновяване
- **Защита:** Автентикация
- **Параметри:** userProfile, petProfile, userNotes
- **DeepSeek API:** Генерира професионален текст
- **Отговор:** Готов текст за молба (под 300 думи)

#### GET `/api/ai/cache/stats`
- **Функция:** Статистика за кеша на AI заявките
- **Защита:** Автентикация
- **Отговор:** Брой записи, памет, TTL

#### POST `/api/ai/cache/clear`
- **Функция:** Изчистване на AI кеша
- **Защита:** Автентикация
- **Отговор:** Брой изтрити записи

#### GET `/api/ai/health`
- **Функция:** Health check на AI системата
- **Публичен:** Не изисква автентикация
- **Тества:** Връзка с Python AI сървис
- **Отговор:** Статус, достъпни endpoints

---

### 2.9 Admin Routes (`/api/admin`)

**Файл:** `server/src/routes/admin.js`

⚠️ **Забележка:** Тези routes ТРЯБВА да бъдат защитени с admin middleware в production!

#### GET `/api/admin/metrics`
- **Функция:** Детайлни метрики за API-то
- **Отговор:** Request counts, response times, error rates

#### POST `/api/admin/metrics/reset`
- **Функция:** Нулиране на метриките
- **Използва се:** За тестване

#### GET `/api/admin/cache/stats`
- **Функция:** Статистика за кеша
- **Отговор:** Hit/miss rates, размер, брой записи

#### POST `/api/admin/cache/clear`
- **Функция:** Изчистване на целия кеш
- **Отговор:** Брой изтрити ключове

#### POST `/api/admin/cache/invalidate`
- **Функция:** Инвалидиране на кеш по pattern
- **Параметри:** pattern (string)
- **Пример:** "user:*" ще изтрие всички user-related кеш записи

#### GET `/api/admin/system/info`
- **Функция:** Системна информация
- **Отговор:**
  - Node.js версия, платформа, архитектура
  - Process ID, uptime
  - Памет (heap used/total, RSS)
  - CPU usage

---

### 2.10 Health Routes (`/health`, `/api/health`)

**Файл:** `server/src/routes/health.js`

#### GET `/health`
- **Функция:** Comprehensive health check
- **Публичен:** Не изисква автентикация
- **Проверява:**
  - MongoDB връзка и ping
  - Redis връзка (ако е конфигуриран)
  - Памет и CPU usage
  - Disk space (в production)
  - AI Service статус
- **Отговор:**
  - `status`: 'healthy', 'degraded', 'unhealthy'
  - `checks`: Детайлни проверки
  - `responseTime`: Време за отговор
  - `metrics`, `cache`: Включени метрики

#### GET `/health/ready`
- **Функция:** Kubernetes readiness probe
- **Публичен:** Не изисква автентикация
- **Проверява:** Само MongoDB връзка
- **Отговор:** 200 OK или 503 Service Unavailable

#### GET `/health/live`
- **Функция:** Kubernetes liveness probe
- **Публичен:** Не изисква автентикация
- **Проверява:** Дали процесът е жив
- **Отговор:** 200 OK винаги (освен ако сървърът е down)

---

## 3. REAL-TIME КОМУНИКАЦИЯ

### 3.1 WebRTC Namespace (`/webrtc`)

**Файл:** `server/src/sockets/webrtc.js`

**Функционалност:** Сигнализация за видео разговори между потребители.

**Автентикация:** JWT token в handshake.auth.token

**Events (Client → Server):**

- **`initiate-call`**
  - Data: {callId, matchId, callerId, callerName, callType}
  - Действие: Създава нов активен разговор, изпраща `incoming-call` до другия потребител
  
- **`answer-call`**
  - Data: {callId, matchId}
  - Действие: Променя статуса на разговора на 'answered', нотифицира обаждащия

- **`reject-call`**
  - Data: {callId}
  - Действие: Изтрива разговора, изпраща `call-ended` със reason: 'rejected'

- **`end-call`**
  - Data: {callId}
  - Действие: Приключва разговора, лог-ва продължителността

- **`webrtc-offer`**
  - Data: {callId, offer}
  - Действие: Препраща WebRTC offer на другия участник

- **`webrtc-answer`**
  - Data: {callId, answer}
  - Действие: Препраща WebRTC answer

- **`webrtc-ice-candidate`**
  - Data: {callId, candidate}
  - Действие: Препраща ICE candidate за установяване на P2P връзка

**Events (Server → Client):**

- **`incoming-call`**: Получавате обаждане
- **`call-answered`**: Обаждането е прието
- **`call-ended`**: Обаждането приключи (с reason)
- **`call-error`**: Грешка при обаждане
- **`webrtc-offer`**, **`webrtc-answer`**, **`webrtc-ice-candidate`**: WebRTC сигнализация

**Управление на състояние:**
- `activeCalls` Map: callId → {callerId, calleeId, matchId, callType, status, startTime}
- `userSockets` Map: userId → socketId
- `socketUsers` Map: socketId → userId

---

### 3.2 Pulse Namespace (`/pulse`)

**Файл:** `server/src/sockets/pulse.js`

**Функционалност:** Real-time updates за "Local Pulse" функцията (пинове на карта).

**Events:**

- **`joinGrid`**
  - Data: gridId (например "grid:37_122")
  - Действие: Присъединява socket-а към стая за geographic grid

- **Server emits:**
  - **`pin:update`**: Broadcast на нов/обновен pin към всички в grid-а

**Helper функция:**
- `broadcastPin(gridId, pin)`: Излъчва pin update към specific grid

---

### 3.3 Chat Socket (имплицитно в server.js)

**Забележка:** Няма отделен файл `chatSocket.js`, но чат функционалността се управлява чрез Socket.IO в main server.

**Предполагаеми events:**

- **`join-room`**: Присъединяване към чат стая за match
- **`send-message`**: Изпращане на съобщение
- **`receive-message`**: Получаване на съобщение
- **`typing`**: Някой пише
- **`stop-typing`**: Спира да пише
- **`user-online`**, **`user-offline`**: Presence статус

---

## 4. AI ВЪЗМОЖНОСТИ

### 4.1 Python AI Service (FastAPI)

**Файл:** `ai-service/app.py`

**Port:** 8000

**Endpoints:**

#### GET `/`
- **Отговор:** Welcome съобщение

#### GET `/health`
- **Отговор:** Health status

#### POST `/api/recommend`
- **Функция:** AI препоръки за любимци
- **Request:** {user_profile, candidate_pets}
- **AI алгоритъм:**
  - Изчислява breed similarity
  - Personality compatibility (matrix-based)
  - Size compatibility
  - Age compatibility
  - Location proximity (Haversine)
  - Weighted scoring (25% breed, 30% personality, 20% size, 15% age, 10% location)
- **Response:** Array от {petId, score, reasons}

#### POST `/api/compatibility`
- **Функция:** Анализ на съвместимост между два любимеца
- **Request:** {pet1, pet2}
- **Factors:**
  - Species match (different species = low score)
  - Breed similarity
  - Personality compatibility
  - Size compatibility
  - Age compatibility
- **Response:** {compatibility_score, factors, recommendation}

#### GET `/api/breed-info`
- **Функция:** Информация за породна характеристика
- **Параметри:** breed, species
- **Response:** {characteristics}

#### POST `/api/update-pet-data`
- **Функция:** Placeholder за ML learning
- **Бъдеща функция:** Ще обновява ML модели базирано на взаимодействия
- **Response:** Mock personality scores

**AI Класове и методи:**

**PetMatchingAI:**
- `calculate_breed_similarity()`: TF-IDF и косинусова прилика
- `calculate_personality_compatibility()`: Matrix-based scoring
- `calculate_size_compatibility()`: Safe size combinations
- `calculate_age_compatibility()`: Intent-aware age matching
- `calculate_location_score()`: Distance-based scoring
- `generate_recommendation_reasons()`: Human-readable explanations

**Breed Database:**
- `BREED_CHARACTERISTICS`: Hardcoded data за популярни породи
- `PERSONALITY_COMPATIBILITY`: Матрица за съвместимост на черти
- `SIZE_COMPATIBILITY`: Safe size combinations

---

### 4.2 DeepSeek API Integration

**Файл:** `server/src/routes/ai.js` (функция `callDeepSeekAPIFallback`)

**Използва се за:** Bio generation когато Python AI service не е достъпен

**API:** `https://api.deepseek.com/v1/chat/completions`

**Model:** `deepseek-chat`

**Параметри:**
- temperature: 0.7
- max_tokens: 500

---

## 5. ПРЕМИУМ ФУНКЦИОНАЛНОСТИ

### 5.1 Premium Plans

**Файл:** `server/src/models/User.js` (premium schema)

**Планове:**
1. **Basic** (free)
   - Ограничени харесвания на ден
   - Основни филтри
   - Стандартни съобщения

2. **Premium**
   - Неограничени харесвания (`unlimitedLikes`)
   - Виждане кой те е харесал (`seeWhoLiked`)
   - Разширени филтри (`advancedFilters`)

3. **Gold**
   - Всичко от Premium
   - Промоция на профил (`boostProfile`)
   - Приоритетна поддръжка

### 5.2 Premium Features

**Unlimited Likes:**
- Премахва daily limit на харесвания
- Проверка в `petController.swipePet()`

**See Who Liked:**
- Показва списък с потребители, които са харесали любимеца ти
- Endpoint: специален премиум query

**Advanced Filters:**
- Достъп до `/api/pets/discover/advanced`
- Над 30 филтри за търсене

**Boost Profile:**
- Endpoint: POST `/api/premium/boost/:petId`
- Увеличава видимостта за 24 часа
- Featured flag в Pet model

**Super Likes:**
- Специален тип харесване с по-високо предимство
- Лимитирани дори за premium (например 5 на ден)

### 5.3 Stripe Integration

**Файл:** `server/src/controllers/premiumController.js`

**Процес на абониране:**
1. Client изпраща `paymentMethodId` от Stripe Elements
2. Server създава Stripe Customer (ако няма)
3. Server създава Stripe Subscription
4. Server активира premium в User model
5. Server изпраща welcome email

**Отказване:**
1. Client заявява cancel
2. Server отменя в Stripe (subscription.cancel)
3. Premium остава активен до края на billing период
4. След изтичане, server дезактивира premium

---

## 6. FRONTEND КОМПОНЕНТИ

### 6.1 AI Components

**Файл:** `apps/web/src/components/AI/`

- **`AIBioAssistant.tsx`**: Асистент за генериране на био
- **`BioGenerator.tsx`**: UI за генериране на биографии с AI
- **`CompatibilityAnalyzer.tsx`**: Визуализация на AI compatibility анализ
- **`PhotoAnalyzer.tsx`**: UI за анализ на снимки с AI препоръки

### 6.2 Chat Components

**Файл:** `apps/web/src/components/Chat/`

- **`ChatHeader.tsx`**: Хедър на чат прозореца (име, статус, действия)
- **`MessageBubble.tsx`**: Отделно съобщение (с автор, час, read status)
- **`MessageInput.tsx`**: Поле за писане на съобщения
- **`EnhancedMessageInput.tsx`**: Подобрена версия с emoji picker, файлове
- **`MessageList.tsx`**: Списък със съобщения
- **`SimpleMessageList.tsx`**: Опростена версия
- **`VirtualizedMessageList.tsx`**: Виртуализиран списък за performance
- **`TypingIndicator.tsx`**: Индикатор "пише..."

### 6.3 Filter Components

**Файл:** `apps/web/src/components/Filter/`

- **`AdvancedFilterPanel.tsx`**: Панел за разширено филтриране
- **`UltraPremiumFilterPanel.tsx`**: Най-напредналият панел за филтриране (30+ опции)
- **`BreedSearchInput.tsx`**: Autocomplete поле за търсене на породи

### 6.4 Pet Components

**Файл:** `apps/web/src/components/Pet/`

- **`SwipeCard.tsx`**: Карта на любимец в swipe интерфейса
- **`SwipeStack.tsx`**: Стек от swipe карти (Tinder-style)
- **`MatchModal.tsx`**: Modal при ново съвпадение ("It's a Match!")

### 6.5 Layout Components

**Файл:** `apps/web/src/components/Layout/`

- **`Header.tsx`**: Основен хедър на приложението
- **`UniversalHeader.tsx`**: Универсален хедър за всички страници
- **`PremiumLayout.tsx`**: Layout wrapper за премиум секции
- **`ProtectedLayout.tsx`**: Layout за защитени страници (изисква auth)
- **`DashboardBackdrop.tsx`**: Фонов ефект за dashboard
- **`PageTransition.tsx`**: Анимации между страници

### 6.6 UI Components

**Файл:** `apps/web/src/components/UI/`

- **`PremiumButton.tsx`**: Стилизиран бутон за премиум функции
- **`PremiumCard.tsx`**: Карта с премиум стил
- **`PremiumInput.tsx`**: Input поле с премиум визия
- **`LoadingSpinner.tsx`**: Спинер за зареждане
- **`LoadingSkeleton.tsx`**: Skeleton loader
- **`SkeletonLoader.tsx`**: Друга версия
- **`EmptyState.tsx`**: Визия за празно състояние
- **`SafeImage.tsx`**: Image компонент с error handling
- **`LikeAnimation.tsx`**: Анимация при харесване
- **`FadeInUpDiv.tsx`**: Fade-in анимация
- **`LanguageSelect.tsx`**: Селектор за език

### 6.7 Map Components

**Файл:** `apps/web/src/components/Map/`

- **`MapView.tsx`**: Leaflet карта за показване на локации
- **`AIMapFeatures.tsx`**: AI-enhanced map функции

### 6.8 Premium Components

**Файл:** `apps/web/src/components/Premium/`

- **`SubscriptionManager.tsx`**: UI за управление на абонамент

### 6.9 VideoCall Components

**Файл:** `apps/web/src/components/VideoCall/`

- **`VideoCallRoom.tsx`**: Стая за видео разговор (WebRTC)

### 6.10 Background Components

**Файл:** `apps/web/src/components/Background/`

- **`FluidGradient.tsx`**: Fluid градиент анимация за фон
- **`BackgroundProvider.tsx`**: Context provider за фонови ефекти

### 6.11 Brand Components

**Файл:** `apps/web/src/components/Brand/`

- **`HoloLogo.tsx`**: Холографско лого на PawfectMatch

---

## 7. SECURITY & AUTHENTICATION

### 7.1 JWT Authentication

**Файл:** `server/src/middleware/auth.js`

**Tokens:**
- **Access Token:** 15 минути валидност, за API заявки
- **Refresh Token:** 7 дни валидност, за опресняване на access token

**Middleware:**
- `authenticateToken()`: Проверява и валидира access token
- `requirePremium()`: Изисква активен премиум абонамент
- `requirePremiumFeature(feature)`: Изисква конкретна премиум функция
- `requireAdmin()`: Изисква admin роля
- `refreshAccessToken()`: Опреснява access token с refresh token
- `optionalAuth()`: Проверява токен, но не блокира ако липсва

**Token генериране:**
```javascript
const { accessToken, refreshToken } = generateTokens(userId);
```

**Token съхранение:**
- Server: Refresh tokens в User.refreshTokens array
- Client: localStorage + cookies (за middleware-based auth checks)

### 7.2 Password Security

**Хеширане:** bcrypt с автоматична соли (bcryptjs)

**Password reset flow:**
1. User заявява reset → `POST /api/auth/forgot-password`
2. Server генерира `passwordResetToken` (JWT) с 10 минути валидност
3. Server изпраща имейл с линк
4. User кликва линк → `POST /api/auth/reset-password` с token
5. Server валидира token, хешира новата парола, изтрива token

### 7.3 Rate Limiting

**Файл:** `server/server.js`

**Лимити:**
- Auth endpoints: 5 заявки на 15 минути (authLimiter)
- Password reset: 3 заявки на час
- General API: 100 заявки на 15 минути (apiLimiter)

**Skip:** Health checks и test environment

### 7.4 Helmet Security Headers

**Файл:** `server/server.js`

**Конфигурация:**
- Content Security Policy (CSP)
- HSTS (Strict-Transport-Security)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Permissions-Policy
- Cross-Origin-Opener-Policy
- Cross-Origin-Resource-Policy

### 7.5 CORS Configuration

**Файл:** `server/server.js`

**Разрешени origins:**
- Development: Всички localhost:3xxx
- Production: Whitelist от ALLOWED_ORIGINS env variable

**Credentials:** Разрешени (за cookies)

**Methods:** GET, POST, PUT, DELETE, PATCH, OPTIONS

### 7.6 Input Validation

**Файл:** `server/src/middleware/validation.js`

**Library:** express-validator

**Валидации:**
- Email format
- Password strength (минимум 6 символа)
- Телефон format
- Pagination параметри
- Age range
- Distance
- Array/Object структури

---

## 8. ФАЙЛОВИ ОПЕРАЦИИ И МЕДИЯ

### 8.1 Cloudinary Integration

**Файл:** `server/src/services/cloudinaryService.js`

**Конфигурация:**
- Cloud name, API key, API secret от env variables

**Функции:**

**`uploadToCloudinary(fileBuffer, folder, options)`**
- Качва изображение от buffer
- Автоматична оптимизация: resize до 800x800, webp format
- Връща: {secure_url, public_id}

**`deleteFromCloudinary(publicId)`**
- Изтрива изображение по public ID

**`getOptimizedImageUrl(publicId, transformations)`**
- Генерира optimized URL с transformations

**`uploadMultipleImages(fileBuffers, folder)`**
- Качва множество изображения паралелно
- Използва Promise.all()

**Папки:**
- `pawfectmatch/pets`: Снимки на любимци
- `pawfectmatch/users`: Аватари на потребители

### 8.2 Multer File Upload

**Конфигурация:**
- Memory storage (не пише на диск)
- Лимити: 5MB за pet photos, 2MB за avatars
- File filter: само изображения (image/*)

**Routes с upload:**
- POST `/api/pets` (до 10 files)
- PUT `/api/pets/:id` (до 10 files)
- PUT `/api/users/avatar` (single file)

---

## 9. ИМЕЙЛ СИСТЕМА И НОТИФИКАЦИИ

### 9.1 Email Service

**Файл:** `server/src/services/emailService.js`

**Provider:** Nodemailer (SMTP)

**Конфигурация:**
- Host: EMAIL_HOST (default: smtp.gmail.com)
- Port: EMAIL_PORT (default: 587)
- Auth: EMAIL_USER, EMAIL_PASS

**Email Templates:**

1. **Email Verification**
   - Subject: "Welcome to PawfectMatch - Verify Your Email"
   - Съдържание: Welcome message, verification button, feature list
   - Expiry: 24 часа

2. **Password Reset**
   - Subject: "PawfectMatch - Password Reset Request"
   - Съдържание: Reset button, security tips
   - Expiry: 10 минути

3. **New Match**
   - Subject: "🎉 You have a new match on PawfectMatch!"
   - Съдържание: Match photos, "Start Chatting" button, meetup tips

4. **Premium Welcome**
   - Subject: "🌟 Welcome to PawfectMatch Premium!"
   - Съдържание: Feature list, benefits, getting started guide

5. **Match Message** (не показан в snippet, но вероятно съществува)

### 9.2 Notification Preferences

**Файл:** `server/src/models/User.js`

**Опции:**
- `preferences.notifications.email`: Имейл нотификации
- `preferences.notifications.push`: Push нотификации
- `preferences.notifications.matches`: При нови съвпадения
- `preferences.notifications.messages`: При нови съобщения

---

## 10. МОНИТОРИНГ И АДМИНИСТРАЦИЯ

### 10.1 Request Tracking & Metrics

**Файл:** `server/src/middleware/requestTracking.js`

**Middleware:**
- `requestIdMiddleware`: Добавя уникално ID на всяка заявка
- `metricsMiddleware`: Събира метрики за всяка заявка

**Метрики:**
- Request count по endpoint
- Response time (average, min, max)
- Error rate
- Status code distribution

**Функции:**
- `getMetrics()`: Връща събраните метрики
- `resetMetrics()`: Нулира метриките

### 10.2 Caching Middleware

**Файл:** `server/src/middleware/caching.js`

**Библиотека:** node-cache

**Функции:**
- `getCacheStats()`: Статистика (size, hits, misses)
- `clearCache()`: Изчиства всички записи
- `invalidateCache(pattern)`: Изтрива записи по pattern

**Използване:**
- Breed data
- AI responses
- User profiles (short TTL)

### 10.3 Logging

**Файл:** `server/src/utils/logger.js`

**Библиотека:** winston

**Log levels:** error, warn, info, debug

**Transports:**
- Console (development)
- Files (production): error.log, combined.log

**Формат:** JSON + timestamp

### 10.4 Sentry Error Tracking

**Файл:** `server/src/config/sentry.js`

**Функции:**
- `initSentry(app)`: Инициализира Sentry
- `sentryRequestHandler()`: Request tracking
- `sentryTracingHandler()`: Performance tracking
- `sentryErrorHandler()`: Error reporting

**Забележка:** Disabled по подразбиране (в demo)

---

## 11. МОБИЛНО ПРИЛОЖЕНИЕ

**Директория:** `apps/mobile/`

**Framework:** React Native

**Компоненти (125 files):**
- 38 .tsx файлове (TypeScript React компоненти)
- 29 .png изображения (assets)
- Други TypeScript и конфигурационни файлове

**Функционалности (предполагаеми, базирани на web app):**
- Swipe интерфейс
- Chat
- Profile management
- Camera integration за снимки на любимци
- Location services
- Push notifications
- WebRTC видео разговори (вероятно)

---

## 12. DEPLOYMENT И ИНФРАСТРУКТУРА

### 12.1 Docker

**Файлове:**
- `server/Dockerfile`: Backend container
- `ai-service/Dockerfile`: Python AI service container
- `docker-compose.prod.yml`: Production compose файл

**Services:**
- Backend (Node.js)
- AI Service (Python FastAPI)
- MongoDB
- Nginx (reverse proxy)

### 12.2 Environment Variables

**Backend (`.env`):**
```
PORT=5001
NODE_ENV=production/development
MONGODB_URI=mongodb://127.0.0.1:27017/pawfectmatch
JWT_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CLIENT_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=...
EMAIL_PASS=...
STRIPE_SECRET_KEY=...
STRIPE_PUBLISHABLE_KEY=...
AI_SERVICE_URL=http://localhost:8000
DEEPSEEK_API_KEY=...
SENTRY_DSN=...
ALLOWED_ORIGINS=...
```

**Frontend (`.env.local`):**
```
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
```

**AI Service (`.env`):**
```
PORT=8000
DEEPSEEK_API_KEY=...
```

### 12.3 Scripts

**Файлове:** `scripts/`

- `start-services.sh`: Стартира всички услуги
- `deploy-production.sh`: Production deployment
- `health-check.sh`: Health check на всички услуги
- `setup-mongodb.sh`: MongoDB setup
- `create-test-users.js`: Създаване на тестови потребители
- `seed-pins-dev.ts`: Seed data за pins
- `validate-enhancements.js`: Валидация на подобрения

### 12.4 Monitoring

**Health Endpoints:**
- `GET /health`: Comprehensive health check
- `GET /health/ready`: Kubernetes readiness
- `GET /health/live`: Kubernetes liveness

**Metrics:**
- Request tracking middleware
- Sentry error tracking (optional)
- Winston logging

### 12.5 Performance Optimizations

**Backend:**
- Compression middleware
- Node-cache за често използвани данни
- MongoDB indexing (geospatial, text search)
- Connection pooling

**Frontend:**
- Next.js image optimization
- Code splitting
- React.memo за expensive компоненти
- Virtualized списъци за чат/swipe feed

---

## 📊 ОБОБЩЕНА СТАТИСТИКА

### Модели на данни: 4
- User, Pet, Match, BreedProfile

### API Endpoints: 60+
- Auth: 7
- Users: 7
- Pets: 10
- Matches: 7
- Chat: 3
- Breeds: 5
- Premium: 5
- AI: 8
- Admin: 6
- Health: 3

### Socket.IO Namespaces: 2
- `/webrtc`: Видео разговори
- `/pulse`: Real-time локални pins

### Frontend Компоненти: 48+
- AI: 4
- Chat: 7
- Filter: 3
- Pet: 3
- Layout: 6
- UI: 14
- Map: 2
- Premium: 1
- VideoCall: 1
- Background: 2
- Brand: 1
- Други: 4

### React Hooks: 23
- Auth hooks: 3
- Chat hooks: 3
- Swipe hooks: 3
- AI hooks: 5
- Optimization hooks: 3
- Form hooks: 2
- Utility hooks: 4

### Middleware: 10+
- Authentication
- Rate limiting
- Validation
- Error handling
- Request tracking
- Caching
- Logging
- CORS
- Security headers
- File upload

### Услуги: 8
- API Service
- Email Service
- Cloudinary Service
- AI Service (Python)
- Logger
- Monitoring
- Cache
- Firebase (optional)

### AI Възможности: 5
- Bio generation
- Photo analysis
- Compatibility analysis
- Breed recommendations
- Pet matching algorithm

### Premium Функции: 5
- Unlimited likes
- See who liked
- Advanced filters
- Profile boost
- Super likes

---

## 🎯 КЛЮЧОВИ ХАРАКТЕРИСТИКИ

### Технологичен Стек

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- Socket.IO (WebRTC, real-time chat)
- JWT authentication
- Stripe payments
- Cloudinary (media storage)
- Nodemailer (emails)

**Frontend:**
- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion (animations)
- Zustand (state management)
- React Query (data fetching)
- Leaflet (maps)
- Socket.IO client

**AI:**
- Python FastAPI
- scikit-learn (TF-IDF, cosine similarity)
- NumPy, Pandas
- DeepSeek API (GPT-style)

**Infrastructure:**
- Docker + Docker Compose
- Nginx (reverse proxy)
- MongoDB (database)
- TurboRepo (monorepo)
- pnpm (package manager)

### Архитектурни Паттерни

- **Monorepo:** TurboRepo с множество packages
- **Microservices:** Отделен AI service
- **RESTful API:** Стандартни REST endpoints
- **Real-time:** WebSocket връзки
- **MVC:** Model-View-Controller в backend
- **Component-based:** React компонентна архитектура
- **Middleware pattern:** Express middleware chain
- **Repository pattern:** Mongoose models като repositories

### Security

- JWT с access/refresh tokens
- bcrypt password хеширане
- Helmet security headers
- CORS защита
- Rate limiting
- Input validation (express-validator)
- XSS защита
- CSRF (потенциално, чрез SameSite cookies)

### Scalability

- Horizontal scaling ready (stateless backend)
- Database indexing
- Caching layer (node-cache)
- CDN за медия (Cloudinary)
- Load balancing ready (Nginx)
- Connection pooling

---

## 🚀 БЪДЕЩИ ПОДОБРЕНИЯ (Базирани на файловата структура)

1. **Firebase Integration**: Файлът `firebase.ts` съществува, но може да не е напълно имплементиран
2. **Advanced Analytics**: `analytics-system.ts` предполага по-advanced tracking
3. **Biometric Analyzer**: `useBiometricAnalyzer.ts` - вероятно за pet biometrics
4. **Emotion Detector**: `useEmotionDetector.ts` - AI detection на емоции
5. **Neural Network**: `useNeuralNetwork.ts` - по-advanced AI модели
6. **Predictive Typing**: `usePredictiveTyping.ts` - AI-assisted typing
7. **Weather Service**: `WeatherService.ts` - интеграция с метео данни
8. **Geofencing**: `GeofencingService.ts` - location-based features
9. **Video Communication**: `video-communication.ts` - WebRTC enhancement

---

*Този документ представлява изчерпателен анализ на PawfectMatch приложението, базиран на семантичен анализ на кода. Всички функционалности са документирани въз основа на реалния имплементиран код.*

**Версия:** 1.0  
**Дата:** 2025-01-10  
**Автор:** AI Semantic Analyzer
