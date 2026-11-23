# Multi-stage Docker build for Spring Boot
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app

# Configure Maven mirror to bypass Maven Central 429 rate limits
COPY settings.xml /root/.m2/settings.xml

# Copy pom.xml and source code
COPY pom.xml ./
COPY src ./src

# Build application skipping tests with retry logic
RUN mvn clean package -DskipTests -B -s /root/.m2/settings.xml \
    -Dmaven.wagon.http.retryHandler.count=5 \
    -Dmaven.wagon.http.retryHandler.requestSentEnabled=true

# Stage 2: Minimal Production JRE Runtime
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy built artifact
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENV PORT=8080

# Tuned memory limits for free cloud containers (512MB RAM)
ENTRYPOINT ["java", "-Xms256m", "-Xmx450m", "-jar", "app.jar"]
