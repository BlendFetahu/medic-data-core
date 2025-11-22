# -----------------------
# 1. Përdor Node si imazh bazë
# -----------------------
FROM node:18

# -----------------------
# 2. Vendos direktorinë e punës
# -----------------------
WORKDIR /app

# -----------------------
# 3. Kopjo paketat për të shpejtuar build-in
# -----------------------
COPY package*.json ./

# -----------------------
# 4. Instalo dependencat
# -----------------------
RUN npm install

# -----------------------
# 5. Kopjo pjesën tjetër të projektit
# -----------------------
COPY . .

# -----------------------
# 6. Ekspozo portin e Auth Service
# -----------------------
EXPOSE 5001

# -----------------------
# 7. Komanda e nisjes
# -----------------------
CMD ["npm", "start"]
