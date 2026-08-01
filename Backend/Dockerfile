# 1. Build Stage using the raw JDK 25 image
FROM eclipse-temurin:25-jdk-jammy AS build

# Manually install Maven since no official Java 25 + Maven image exists yet
RUN apt-get update && apt-get install -y maven

WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# 2. Runtime Stage
FROM eclipse-temurin:25-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 9000
ENTRYPOINT ["java", "-jar", "app.jar"]