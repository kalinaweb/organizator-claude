# Laravel Sanctum Authentication Implementation Plan

## Context

The user requested adding authentication to the Laravel backend API. Currently, the application has NO authentication infrastructure - no User model, no auth packages, and all API routes are completely open. The existing codebase follows a minimal CRUD pattern with controllers directly using Eloquent, inline validation, and no service/repository layers.

**Why this change is needed:**
- Secure the API endpoints so only authenticated users can access their data
- Implement user registration and login functionality
- Establish user ownership of pages (and cascading to lists/tasks)

**Architecture decisions (confirmed with user):**
- Use Laravel Sanctum for API token authentication (simpler than JWT packages)
- Follow existing minimal pattern - controllers call Eloquent directly with inline validation
- No repository/service layers to maintain consistency with existing PageController/ListController/TaskController

## Implementation Plan

### 1. Install Laravel Sanctum

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

### 2. Create User Model and Migration

**File:** `apps/backend/database/migrations/2024_09_11_000001_create_users_table.php`

```php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->string('password');
    $table->timestamp('email_verified_at')->nullable();
    $table->rememberToken();
    $table->timestamps();
});
```

**File:** `apps/backend/app/Models/User.php`

Standard Laravel User model with:
- `use HasApiTokens, HasFactory, Notifiable`
- `$fillable = ['name', 'email', 'password']`
- `$hidden = ['password', 'remember_token']`
- `$casts = ['email_verified_at' => 'datetime', 'password' => 'hashed']`
- `pages()` relationship: `hasMany(Page::class)`

### 3. Add user_id to pages table

**File:** `apps/backend/database/migrations/2024_09_11_000002_add_user_id_to_pages_table.php`

```php
Schema::table('pages', function (Blueprint $table) {
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
});
```

Update Page model to add:
- `'user_id'` to $fillable
- `belongsTo(User::class)` relationship

### 4. Create AuthController

**File:** `apps/backend/app/Http/Controllers/AuthController.php`

Following the existing controller pattern (no constructor injection, inline validation):

**Methods:**
- `register(Request $request)` - validate (name, email, password), hash password, create user, return token
- `login(Request $request)` - validate (email, password), check credentials, return token  
- `logout(Request $request)` - revoke current token
- `me(Request $request)` - return authenticated user

**Validation rules:**
- Register: name (required, string, max:255), email (required, email, unique:users), password (required, min:8, confirmed)
- Login: email (required, email), password (required)

### 5. Update API Routes

**File:** `apps/backend/routes/api.php`

Add auth routes (public):
```php
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
```

Protect existing routes with Sanctum middleware:
```php
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // All existing Page/List/Task routes
});
```

### 6. Update Controllers to Scope by User

**PageController changes:**
- `index()`: `auth()->user()->pages()->with('lists')->get()`
- `store()`: `auth()->user()->pages()->create($validated)`
- `show($id)`: `auth()->user()->pages()->with('lists.tasks')->findOrFail($id)`
- `update($id)`: `auth()->user()->pages()->findOrFail($id)` before update
- `destroy($id)`: `auth()->user()->pages()->findOrFail($id)` before delete

This automatically ensures users can only access their own data.

### 7. Configuration Updates

**File:** `apps/backend/config/sanctum.php` (already published)

Verify stateful domains configuration (may need to add frontend URL for SPA).

**File:** `apps/backend/app/Http/Kernel.php` 

Add to API middleware if not present:
```php
\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
```

## Critical Files to Modify

1. `apps/backend/composer.json` - add Sanctum dependency
2. `apps/backend/app/Models/User.php` - create with HasApiTokens
3. `apps/backend/app/Models/Page.php` - add user_id to fillable, user() relationship  
4. `apps/backend/database/migrations/2024_09_11_000001_create_users_table.php` - create
5. `apps/backend/database/migrations/2024_09_11_000002_add_user_id_to_pages_table.php` - create
6. `apps/backend/app/Http/Controllers/AuthController.php` - create with register/login/logout/me
7. `apps/backend/routes/api.php` - add auth routes, protect existing routes
8. `apps/backend/app/Http/Controllers/PageController.php` - scope queries to auth()->user()

## Verification Steps

1. **Install and setup:**
   ```bash
   cd apps/backend
   composer require laravel/sanctum
   php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
   php artisan migrate:fresh
   ```

2. **Test registration:**
   ```bash
   curl -X POST http://localhost:8000/api/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123","password_confirmation":"password123"}'
   ```
   Should return: `{"token": "...", "user": {...}}`

3. **Test login:**
   ```bash
   curl -X POST http://localhost:8000/api/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```
   Should return: `{"token": "...", "user": {...}}`

4. **Test protected route:**
   ```bash
   curl -X GET http://localhost:8000/api/pages \
     -H "Authorization: Bearer {token}"
   ```
   Should return: user's pages array

5. **Test without token:**
   ```bash
   curl -X GET http://localhost:8000/api/pages
   ```
   Should return: 401 Unauthorized

6. **Test user isolation:**
   - Create two users
   - Login as user 1, create a page
   - Login as user 2, try to access user 1's page by ID
   - Should return: 404 (findOrFail on scoped query)

## Authentication Response Format

All auth endpoints return consistent JSON structure:

**Success response (register/login):**
```json
{
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com",
    "created_at": "2024-09-11T12:00:00.000000Z"
  },
  "token": "1|abcdef123456..."
}
```

**Token format:** Sanctum plain-text tokens in format `{id}|{token}` - client includes in `Authorization: Bearer {token}` header

**Error responses:**
- 422 Validation Error: `{"message": "...", "errors": {"field": ["error"]}}`
- 401 Unauthorized: `{"message": "Invalid credentials"}` or `{"message": "Unauthenticated"}`
