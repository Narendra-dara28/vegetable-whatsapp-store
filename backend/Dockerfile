# Multi-stage Docker build for Spring Boot
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml ./
COPY src ./src

# Build application skipping tests for fast deployment
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal Production JRE Runtime
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy built artifact
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENV PORT=8080

# Tuned memory limits for free cloud containers (512MB RAM)
ENTRYPOINT ["java", "-Xms256m", "-Xmx450m", "-jar", "app.jar"]
