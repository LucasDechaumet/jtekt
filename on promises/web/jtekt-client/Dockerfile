# Étape 1: Utiliser une image Node.js pour construire l'application
FROM node:alpine AS build

# Installer Angular CLI globalement
RUN npm install -g @angular/cli

WORKDIR /app

# Copier package.json et package-lock.json dans le répertoire de travail
COPY package*.json ./

# Debug: Vérifiez que les fichiers sont copiés
RUN ls -l

# Installer les dépendances
RUN npm install

# Copier tous les fichiers du projet dans le répertoire de travail
COPY . .

# Debug: Vérifiez que tous les fichiers sont copiés
RUN ls -l

# Construire l'application Angular
RUN npm run build -- --configuration production

# Étape 2: Utiliser une image Nginx pour servir l'application
FROM nginx:alpine

# Copier les fichiers construits depuis l'étape de construction
COPY --from=build /app/dist/jtekt-client/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 4200 pour accéder à l'application
EXPOSE 80

# Démarrer Nginx en mode non-détaché
CMD ["nginx", "-g", "daemon off;"]