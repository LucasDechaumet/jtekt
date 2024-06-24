# Utilisation d'une image Maven pour construire l'application
FROM maven:3.8.3-openjdk-17-slim AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier le reste des fichiers de l'application
COPY . .

# Construire l'application
RUN mvn package -DskipTests

# Utilisation de l'image JDK pour exécuter l'application
FROM openjdk:17-jdk-slim

# Définir le répertoire de travail
WORKDIR /app

# Copier le jar construit depuis l'étape précédente
COPY --from=builder /app/target/jtekt-server-0.0.1-SNAPSHOT.jar app.jar

# Exposer le port 8081
EXPOSE 8081

# Commande d'entrée pour exécuter l'application
ENTRYPOINT ["java", "-jar", "app.jar"]
