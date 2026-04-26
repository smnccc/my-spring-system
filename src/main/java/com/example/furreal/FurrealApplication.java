package com.example.furreal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.context.WebServerInitializedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.beans.factory.annotation.Autowired;

@SpringBootApplication
public class FurrealApplication {
    
    @Autowired
    private Environment environment;

    public static void main(String[] args) {
        SpringApplication.run(FurrealApplication.class, args);
    }
    
    @EventListener(WebServerInitializedEvent.class)
    public void onWebServerReady(WebServerInitializedEvent event) {
        int port = event.getWebServer().getPort();
        String contextPath = environment.getProperty("server.servlet.context-path", "");
        String baseUrl = "http://localhost:" + port + contextPath;
        
        System.out.println("\n╔════════════════════════════════════════════════════════════════════╗");
        System.out.println("║                                                                    ║");
        System.out.println("║        🐾🐕🐈  FURREAL BACKEND STARTED SUCCESSFULLY!  🐈🐕🐾        ║");
        System.out.println("║                                                                    ║");
        System.out.println("║     📍 API Base URL: " + baseUrl + "                             ║");
        System.out.println("║     🗄️  H2 Console:   http://localhost:" + port + "/h2-console             ║");
        System.out.println("║                                                                    ║");
        System.out.println("║     👤 Admin Email:  admin@furreal.com                            ║");
        System.out.println("║     🔑 Admin Pass:   admin123                                     ║");
        System.out.println("║                                                                    ║");
        System.out.println("║     📋 Available Endpoints:                                       ║");
        System.out.println("║     POST   /auth/login                                            ║");
        System.out.println("║     POST   /auth/register                                         ║");
        System.out.println("║     GET    /pets                                                   ║");
        System.out.println("║     GET    /pets/featured                                         ║");
        System.out.println("║     POST   /pets                                                   ║");
        System.out.println("║     GET    /users/{userId}/profile                                ║");
        System.out.println("║     POST   /adoptions                                              ║");
        System.out.println("║                                                                    ║");
        System.out.println("╚════════════════════════════════════════════════════════════════════╝\n");
    }
}