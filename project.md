╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
 Solomon - Puzzle Game Platform                                                                                                                                           
                                                                                                                                                                          
 Overview                                                                                                                                                                 
                                                                                                                                                                          
 Full-stack puzzle game platform. Users create, share, and play puzzles. Passkey auth, level sharing, completion tracking.                                                
                                                                                                                                                                          
 Tech Stack                                                                                                                                                               
                                                                                                                                                                          
 - Server: Express.js + TypeScript, Prisma ORM, SQLite, JWT                                                                                                               
 - Client: React (Vite) + TypeScript, Tailwind CSS, @simplewebauthn/browser                                                                                               
 - Infra: Single Docker container (Express serves API + static React build), SQLite in Docker volume                                                                      
 - CI/CD: GitHub Actions — build image, push to GHCR, SSH pull on VPS                                                                                                     
                                                                                                                                                                          
 Project Structure                                                                                                                                                        
                                                                                                                                                                          
 solomon/                                                                                                                                                                 
 ├── client/                                                                                                                                                              
 │   ├── src/                                                                                                                                                             
 │   │   ├── components/    # Layout, Navbar, LevelCard, ProtectedRoute                                                                                                   
 │   │   ├── pages/         # Home, Dashboard, Login, About, Terms, LevelEditor*, LevelPlayer*                                                                            
 │   │   ├── hooks/         # useAuth                                                                                                                                     
 │   │   ├── services/      # api, auth                                                                                                                                   
 │   │   └── context/       # AuthContext                                                                                                                                 
 │   ├── index.html                                                                                                                                                       
 │   ├── package.json, vite.config.ts, tailwind.config.js, tsconfig.json                                                                                                  
 ├── server/                                                                                                                                                              
 │   ├── src/                                                                                                                                                             
 │   │   ├── routes/        # auth, levels, users                                                                                                                         
 │   │   ├── middleware/    # auth (JWT verification)                                                                                                                     
 │   │   ├── services/      # passkey                                                                                                                                     
 │   │   └── index.ts       # Express app, serves static client build + API                                                                                               
 │   ├── prisma/schema.prisma                                                                                                                                             
 │   ├── package.json, tsconfig.json                                                                                                                                      
 ├── .github/workflows/deploy.yml                                                                                                                                         
 ├── docker-compose.yml                                                                                                                                                   
 ├── Dockerfile                                                                                                                                                           
 └── .env.example                                                                                                                                                         
                                                                                                                                                                          
 LevelEditor and LevelPlayer are TODO placeholders (700x500 canvas, keyboard input).                                                                                      
                                                                                                                                                                          
 ---                                                                                                                                                                      
 Database Schema (Prisma + SQLite)                                                                                                                                        
                                                                                                                                                                          
 model User {                                                                                                                                                             
   id          String       @id @default(cuid())                                                                                                                          
   username    String       @unique                                                                                                                                       
   createdAt   DateTime     @default(now())                                                                                                                               
   credentials Credential[]                                                                                                                                               
   levels      Level[]                                                                                                                                                    
   completions LevelCompletion[]                                                                                                                                          
 }                                                                                                                                                                        
                                                                                                                                                                          
 model Credential {                                                                                                                                                       
   id           String   @id @default(cuid())                                                                                                                             
   credentialId String   @unique                                                                                                                                          
   publicKey    Bytes                                                                                                                                                     
   counter      BigInt                                                                                                                                                    
   transports   String?  // JSON array                                                                                                                                    
   userId       String                                                                                                                                                    
   user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)                                                                                 
   createdAt    DateTime @default(now())                                                                                                                                  
 }                                                                                                                                                                        
                                                                                                                                                                          
 model Level {                                                                                                                                                            
   id          String   @id @default(cuid())                                                                                                                              
   title       String                                                                                                                                                     
   description String?                                                                                                                                                    
   data        String   // JSON blob for level data                                                                                                                       
   screenshot  String?  // Base64 or file path                                                                                                                            
   published   Boolean  @default(false)                                                                                                                                   
   createdById String                                                                                                                                                     
   createdBy   User     @relation(fields: [createdById], references: [id])                                                                                                
   createdAt   DateTime @default(now())                                                                                                                                   
   updatedAt   DateTime @updatedAt                                                                                                                                        
   completions LevelCompletion[]                                                                                                                                          
 }                                                                                                                                                                        
                                                                                                                                                                          
 model LevelCompletion {                                                                                                                                                  
   id          String   @id @default(cuid())                                                                                                                              
   levelId     String                                                                                                                                                     
   level       Level    @relation(fields: [levelId], references: [id], onDelete: Cascade)                                                                                 
   userId      String                                                                                                                                                     
   user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)                                                                                  
   completedAt DateTime @default(now())                                                                                                                                   
   @@unique([levelId, userId])                                                                                                                                            
 }                                                                                                                                                                        
                                                                                                                                                                          
 ---                                                                                                                                                                      
 API Endpoints                                                                                                                                                            
                                                                                                                                                                          
 Auth (/api/auth)                                                                                                                                                         
 ┌────────┬───────────────────┬───────────────────────────────────────────────────┐                                                                                       
 │ Method │     Endpoint      │                    Description                    │                                                                                       
 ├────────┼───────────────────┼───────────────────────────────────────────────────┤                                                                                       
 │ POST   │ /register/options │ Get passkey registration options (takes username) │                                                                                       
 ├────────┼───────────────────┼───────────────────────────────────────────────────┤                                                                                       
 │ POST   │ /register/verify  │ Verify registration, create user, return JWT      │                                                                                       
 ├────────┼───────────────────┼───────────────────────────────────────────────────┤                                                                                       
 │ POST   │ /login/options    │ Get passkey login options                         │                                                                                       
 ├────────┼───────────────────┼───────────────────────────────────────────────────┤                                                                                       
 │ POST   │ /login/verify     │ Verify login, return JWT                          │                                                                                       
 ├────────┼───────────────────┼───────────────────────────────────────────────────┤                                                                                       
 │ GET    │ /me               │ Get current user (JWT required)                   │                                                                                       
 └────────┴───────────────────┴───────────────────────────────────────────────────┘                                                                                       
 Levels (/api/levels)                                                                                                                                                     
 ┌────────┬───────────────┬────────────────────────────────────────────────────────┐                                                                                      
 │ Method │   Endpoint    │                      Description                       │                                                                                      
 ├────────┼───────────────┼────────────────────────────────────────────────────────┤                                                                                      
 │ GET    │ /             │ List published levels (public, with completion counts) │                                                                                      
 ├────────┼───────────────┼────────────────────────────────────────────────────────┤                                                                                      
 │ GET    │ /:id          │ Get single level                                       │                                                                                      
 ├────────┼───────────────┼────────────────────────────────────────────────────────┤                                                                                      
 │ POST   │ /             │ Create level (auth)                                    │                                                                                      
 ├────────┼───────────────┼────────────────────────────────────────────────────────┤                                                                                      
 │ PUT    │ /:id          │ Update level (auth, owner, not if completed)           │                                                                                      
 ├────────┼───────────────┼────────────────────────────────────────────────────────┤                                                                                      
 │ DELETE │ /:id          │ Delete level (auth, owner, not if completed)           │                                                                                      
 ├────────┼───────────────┼────────────────────────────────────────────────────────┤                                                                                      
 │ POST   │ /:id/publish  │ Publish level (auth, owner)                            │                                                                                      
 ├────────┼───────────────┼────────────────────────────────────────────────────────┤                                                                                      
 │ POST   │ /:id/complete │ Record completion (auth)                               │                                                                                      
 └────────┴───────────────┴────────────────────────────────────────────────────────┘                                                                                      
 Users (/api/users)                                                                                                                                                       
 ┌────────┬────────────┬──────────────────────────────┐                                                                                                                   
 │ Method │  Endpoint  │         Description          │                                                                                                                   
 ├────────┼────────────┼──────────────────────────────┤                                                                                                                   
 │ GET    │ /me/levels │ Current user's levels (auth) │                                                                                                                   
 └────────┴────────────┴──────────────────────────────┘                                                                                                                   
 ---                                                                                                                                                                      
 Business Rules                                                                                                                                                           
                                                                                                                                                                          
 1. Level edit/delete lock: Once a published level has at least one completion, it cannot be edited or deleted                                                            
 2. One completion per user per level: Enforced by DB unique constraint                                                                                                   
 3. Username required: Provided during passkey registration                                                                                                               
 4. Homepage: Shows only published levels                                                                                                                                 
                                                                                                                                                                          
 ---                                                                                                                                                                      
 Implementation Steps                                                                                                                                                     
                                                                                                                                                                          
 Phase 1: Project Scaffolding                                                                                                                                             
                                                                                                                                                                          
 - Init git repo                                                                                                                                                          
 - Create server/ with Express + TypeScript + Prisma                                                                                                                      
 - Create client/ with Vite + React + TypeScript + Tailwind                                                                                                               
 - Create Dockerfile (multi-stage: build client, then copy into server image)                                                                                             
 - Create docker-compose.yml with SQLite volume                                                                                                                           
 - Create .env.example                                                                                                                                                    
                                                                                                                                                                          
 Phase 2: Database                                                                                                                                                        
                                                                                                                                                                          
 - Write Prisma schema                                                                                                                                                    
 - Run prisma generate and prisma db push                                                                                                                                 
                                                                                                                                                                          
 Phase 3: Server — Auth                                                                                                                                                   
                                                                                                                                                                          
 - Implement passkey service using @simplewebauthn/server                                                                                                                 
 - Create auth routes (register options/verify, login options/verify, /me)                                                                                                
 - Create JWT middleware (sign on login/register, verify on protected routes)                                                                                             
                                                                                                                                                                          
 Phase 4: Server — API Routes                                                                                                                                             
                                                                                                                                                                          
 - Level CRUD routes with business rule enforcement                                                                                                                       
 - Level completion endpoint                                                                                                                                              
 - User levels endpoint                                                                                                                                                   
 - Express static middleware to serve client build from ../client/dist                                                                                                    
                                                                                                                                                                          
 Phase 5: Client — Foundation                                                                                                                                             
                                                                                                                                                                          
 - React Router setup (Home, Dashboard, Login, About, Terms, Editor placeholder, Player placeholder)                                                                      
 - AuthContext + useAuth hook (stores JWT in localStorage, calls /api/auth/me on mount)                                                                                   
 - API service (fetch wrapper with JWT header)                                                                                                                            
 - Auth service (passkey registration/login flows using @simplewebauthn/browser)                                                                                          
 - ProtectedRoute component                                                                                                                                               
                                                                                                                                                                          
 Phase 6: Client — Pages                                                                                                                                                  
                                                                                                                                                                          
 - Login/Signup: Username input + passkey button, handles both registration and login                                                                                     
 - Home: Grid of LevelCard components (screenshot, creator, completion count)                                                                                             
 - Dashboard: User's levels list, publish/edit/delete controls, locked indicator for completed levels                                                                     
 - About: Minimal stub ("Content coming soon")                                                                                                                            
 - Terms: Minimal stub ("Content coming soon")                                                                                                                            
 - LevelEditor: TODO placeholder with 700x500 canvas outline                                                                                                              
 - LevelPlayer: TODO placeholder with 700x500 canvas outline                                                                                                              
                                                                                                                                                                          
 Phase 7: CI/CD                                                                                                                                                           
                                                                                                                                                                          
 - GitHub Actions workflow: on push to main, build Docker image, push to GHCR, SSH into VPS to pull and restart                                                           
                                                                                                                                                                          
 ---                                                                                                                                                                      
 Verification                                                                                                                                                             
                                                                                                                                                                          
 1. docker-compose up --build — container starts, serves client at / and API at /api                                                                                      
 2. Register a new user with passkey and username                                                                                                                         
 3. Login with passkey, receive JWT                                                                                                                                       
 4. Create a level from Dashboard                                                                                                                                         
 5. Publish the level                                                                                                                                                     
 6. Verify it appears on Homepage with creator name and 0 completions                                                                                                     
 7. Complete the level as a different user                                                                                                                                
 8. Verify completion count increments to 1                                                                                                                               
 9. Verify the creator can no longer edit or delete the level           
