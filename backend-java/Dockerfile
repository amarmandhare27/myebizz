# ── Build stage ───────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY tools/apache-maven-3.9.9 /opt/maven
ENV PATH="/opt/maven/bin:${PATH}"
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Activate prod profile (PostgreSQL) when DATABASE_URL is set
ENV SPRING_PROFILES_ACTIVE=prod

EXPOSE 8000
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
