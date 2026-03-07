package com.example.backend.controller;

import com.example.backend.dto.BeneficioRequest;
import com.example.backend.dto.TransferenciaRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@DisplayName("Testes de Integração do Controller")
class BeneficioControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Deve listar todos os benefícios")
    void deveListarTodosBeneficios() throws Exception {
        mockMvc.perform(get("/api/v1/beneficios")
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].nome").exists())
                .andExpect(jsonPath("$[0].valor").exists());
    }

    @Test
    @DisplayName("Deve buscar benefício por ID")
    void deveBuscarBeneficioPorId() throws Exception {
        mockMvc.perform(get("/api/v1/beneficios/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nome").exists())
                .andExpect(jsonPath("$.valor").exists())
                .andExpect(jsonPath("$.version").exists());
    }

    @Test
    @DisplayName("Deve retornar 404 ao buscar benefício inexistente")
    void deveRetornar404ParaBeneficioInexistente() throws Exception {
        mockMvc.perform(get("/api/v1/beneficios/9999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value(containsString("não encontrado")));
    }

    @Test
    @DisplayName("Deve criar novo benefício")
    void deveCriarNovoBeneficio() throws Exception {
        BeneficioRequest request = BeneficioRequest.builder()
                .nome("Novo Benefício")
                .descricao("Descrição do novo benefício")
                .valor(new BigDecimal("1500.00"))
                .ativo(true)
                .build();

        mockMvc.perform(post("/api/v1/beneficios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.nome").value("Novo Benefício"))
                .andExpect(jsonPath("$.valor").value(1500.00))
                .andExpect(jsonPath("$.version").value(0));
    }

    @Test
    @DisplayName("Deve retornar erro de validação ao criar benefício com dados inválidos")
    void deveRetornarErroDeValidacao() throws Exception {
        BeneficioRequest request = BeneficioRequest.builder()
                .nome("") 
                .valor(new BigDecimal("-100.00")) 
                .build();

        mockMvc.perform(post("/api/v1/beneficios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Error"));
    }

    @Test
    @DisplayName("Deve atualizar benefício existente")
    void deveAtualizarBeneficio() throws Exception {
        BeneficioRequest request = BeneficioRequest.builder()
                .nome("Benefício Atualizado")
                .descricao("Descrição atualizada")
                .valor(new BigDecimal("2000.00"))
                .ativo(true)
                .build();

        mockMvc.perform(put("/api/v1/beneficios/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nome").value("Benefício Atualizado"))
                .andExpect(jsonPath("$.valor").value(2000.00));
    }

    @Test
    @DisplayName("Deve deletar benefício")
    void deveDeletarBeneficio() throws Exception {
        mockMvc.perform(delete("/api/v1/beneficios/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Deve realizar transferência com sucesso")
    void deveRealizarTransferenciaComSucesso() throws Exception {
        TransferenciaRequest request = TransferenciaRequest.builder()
                .fromId(1L)
                .toId(2L)
                .valor(new BigDecimal("100.00"))
                .build();

        mockMvc.perform(post("/api/v1/beneficios/transferir")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fromId").value(1))
                .andExpect(jsonPath("$.toId").value(2))
                .andExpect(jsonPath("$.valorTransferido").value(100.00))
                .andExpect(jsonPath("$.fromNovoSaldo").exists())
                .andExpect(jsonPath("$.toNovoSaldo").exists())
                .andExpect(jsonPath("$.mensagem").exists());
    }

    @Test
    @DisplayName("Deve retornar erro ao transferir com saldo insuficiente")
    void deveRetornarErroSaldoInsuficiente() throws Exception {
        TransferenciaRequest request = TransferenciaRequest.builder()
                .fromId(1L)
                .toId(2L)
                .valor(new BigDecimal("999999.00")) // Valor muito alto
                .build();

        mockMvc.perform(post("/api/v1/beneficios/transferir")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("Saldo insuficiente")));
    }

    @Test
    @DisplayName("Deve retornar erro ao transferir para mesmo benefício")
    void deveRetornarErroTransferirParaMesmoBeneficio() throws Exception {
        TransferenciaRequest request = TransferenciaRequest.builder()
                .fromId(1L)
                .toId(1L) 
                .valor(new BigDecimal("100.00"))
                .build();

        mockMvc.perform(post("/api/v1/beneficios/transferir")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("mesmo benefício")));
    }

    @Test
    @DisplayName("Deve listar apenas benefícios ativos")
    void deveListarApenasBeneficiosAtivos() throws Exception {
        mockMvc.perform(get("/api/v1/beneficios/ativos")
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].ativo", everyItem(is(true))));
    }
}
