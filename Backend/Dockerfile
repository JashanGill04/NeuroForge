# ---- Build stage: compiles the jar inside Docker (no local Maven/JDK needed) ----
FROM eclipse-temurin:25-jdk-alpine AS build
WORKDIR /app

# Copy wrapper + pom first so dependency downloads are cached across rebuilds
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN chmod +x mvnw
RUN ./mvnw -B dependency:go-offline

# Now copy source and build
COPY src src
RUN ./mvnw -B clean package -DskipTests

# ---- Runtime stage: small JRE-only image ----
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 9000
ENTRYPOINT ["java", "-jar", "app.jar"]
