# Multi-stage Docker build for Spring Boot
FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app

# Copy Maven wrapper & pom
COPY .mvn/ .mvn/
COPY mvnw mvnw.cmd pom.xml ./
RUN chmod +x mvnw

# Build application skipping tests for fast deployment
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Minimal Production JRE Runtime
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy built artifact
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENV PORT=8080

# Tuned memory limits for free cloud containers (512MB RAM)
ENTRYPOINT ["java", "-Xms256m", "-Xmx450m", "-jar", "app.jar"]
