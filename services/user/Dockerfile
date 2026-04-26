# FROM node:22-alpine AS builder

# WORKDIR /app

# COPY package*.json ./

# RUN npm install

# COPY tsconfig.json ./


# ==========================================
# STAGE 1: Builder (TypeScript ko compile karne ke liye)
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Package files copy karein aur sabhi dependencies install karein (DevDependencies ke saath)
COPY package*.json ./
RUN npm install

# TypeScript config aur source code copy karein
COPY tsconfig.json ./
COPY src ./src

# TypeScript code ko build karein (Ye aapke TS ko JS mein convert karke /dist folder banayega)
RUN npm run build


# ==========================================
# STAGE 2: Production (Final image jisme sirf JS run hoga)
# ==========================================
FROM node:22-alpine

WORKDIR /app

# Package files copy karein aur SIRF production dependencies install karein (Size chota rakhne ke liye)
COPY package*.json ./
RUN npm install --omit=dev

# Builder stage se compile hua /dist folder yahan copy karein
COPY --from=builder /app/dist ./dist

# Aapka user service port 8080 par run hota hai (aapke purane logs ke hisaab se)
EXPOSE 8080

# Application ko start karne ka command
CMD ["node", "dist/server.js"]