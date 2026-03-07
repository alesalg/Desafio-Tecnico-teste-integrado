package com.example.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenAPIConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API de Gerenciamento de Benefícios")
                        .version("1.0.0")
                        .description("""
                                API REST completa para gerenciamento de benefícios com:
                                - CRUD completo de benefícios
                                - Transferência entre benefícios com validações
                                - Suporte a Optimistic Locking (@Version)
                                - Integração com EJB para operações críticas
                                - Tratamento global de exceções
                                
                                **Tecnologias:**
                                - Spring Boot 3.2.5
                                - Spring Data JPA
                                - H2 Database
                                - Jakarta EE 10
                                - OpenAPI/Swagger 3
                                """)
                        .contact(new Contact()
                                .name("Suporte Técnico")
                                .email("suporte@example.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080")
                                .description("Servidor de Desenvolvimento"),
                        new Server()
                                .url("https://api.production.com")
                                .description("Servidor de Produção")
                ));
    }
}
