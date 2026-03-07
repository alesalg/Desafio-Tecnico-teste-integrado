package com.example.backend.concurrency;

import com.example.backend.dto.TransferenciaRequest;
import com.example.backend.model.Beneficio;
import com.example.backend.repository.BeneficioRepository;
import com.example.backend.service.BeneficioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;


@SpringBootTest
@DisplayName("Testes de Concorrência")
class ConcurrencyTest {

    @Autowired
    private BeneficioService service;

    @Autowired
    private BeneficioRepository repository;

    @Test
    @DisplayName("Deve prevenir lost updates com transferências concorrentes")
    void devePrevenirLostUpdatesComTransferenciasConcorrentes() throws InterruptedException {
        Beneficio origem = Beneficio.builder()
                .nome("Origem Concorrência")
                .valor(new BigDecimal("10000.00"))
                .ativo(true)
                .build();
        
        Beneficio destino1 = Beneficio.builder()
                .nome("Destino 1")
                .valor(new BigDecimal("1.00"))
                .ativo(true)
                .build();
        
        Beneficio destino2 = Beneficio.builder()
                .nome("Destino 2")
                .valor(new BigDecimal("1.00"))
                .ativo(true)
                .build();

        origem = repository.saveAndFlush(origem);
        destino1 = repository.saveAndFlush(destino1);
        destino2 = repository.saveAndFlush(destino2);

        Long origemId = origem.getId();
        Long destino1Id = destino1.getId();
        Long destino2Id = destino2.getId();

        int numThreads = 10;
        ExecutorService executor = Executors.newFixedThreadPool(numThreads);
        CountDownLatch latch = new CountDownLatch(numThreads);
        AtomicInteger sucessos = new AtomicInteger(0);
        AtomicInteger falhas = new AtomicInteger(0);

        List<Future<?>> futures = new ArrayList<>();

        for (int i = 0; i < numThreads; i++) {
            final int threadNum = i;
            Future<?> future = executor.submit(() -> {
                try {
                    latch.countDown();
                    latch.await(); // Todas threads começam juntas

                    TransferenciaRequest request = TransferenciaRequest.builder()
                            .fromId(origemId)
                            .toId(threadNum % 2 == 0 ? destino1Id : destino2Id)
                            .valor(new BigDecimal("1000.00"))
                            .build();

                    service.transferir(request);
                    sucessos.incrementAndGet();
                } catch (Exception e) {
                    falhas.incrementAndGet();
                }
            });
            futures.add(future);
        }

        executor.shutdown();
        executor.awaitTermination(30, TimeUnit.SECONDS);

        Beneficio origemFinal = repository.findById(origemId).orElseThrow();
        Beneficio destino1Final = repository.findById(destino1Id).orElseThrow();
        Beneficio destino2Final = repository.findById(destino2Id).orElseThrow();

        // Verifica consistência: soma total deve ser preservada
        BigDecimal somaTotal = origemFinal.getValor()
                .add(destino1Final.getValor())
                .add(destino2Final.getValor());
        assertThat(somaTotal).isEqualByComparingTo("10002.00"); // Valor inicial total

        // Verifica que houve transferências bem-sucedidas
        assertThat(sucessos.get()).isGreaterThan(0);
        assertThat(sucessos.get() + falhas.get()).isEqualTo(10);

        System.out.println("=== RESULTADO DO TESTE DE CONCORRÊNCIA ===");
        System.out.println("Sucessos: " + sucessos.get());
        System.out.println("Falhas: " + falhas.get());
        System.out.println("Saldo origem final: " + origemFinal.getValor());
        System.out.println("Saldo destino1 final: " + destino1Final.getValor());
        System.out.println("Saldo destino2 final: " + destino2Final.getValor());
        System.out.println("Soma total: " + somaTotal);
    }

    @Test
    @DisplayName("Deve tratar corretamente race condition com saldo insuficiente")
    void deveTratarRaceConditionComSaldoInsuficiente() throws InterruptedException {
        Beneficio origem = Beneficio.builder()
                .nome("Origem Race Condition")
                .valor(new BigDecimal("3000.00")) 
                .ativo(true)
                .build();
        
        Beneficio destino = Beneficio.builder()
                .nome("Destino Race")
                .valor(new BigDecimal("1.00"))
                .ativo(true)
                .build();

        origem = repository.saveAndFlush(origem);
        destino = repository.saveAndFlush(destino);

        Long origemId = origem.getId();
        Long destinoId = destino.getId();

        int numThreads = 10;
        ExecutorService executor = Executors.newFixedThreadPool(numThreads);
        CountDownLatch latch = new CountDownLatch(numThreads);
        AtomicInteger sucessos = new AtomicInteger(0);
        AtomicInteger falhasSaldoInsuficiente = new AtomicInteger(0);

        for (int i = 0; i < numThreads; i++) {
            executor.submit(() -> {
                try {
                    latch.countDown();
                    latch.await();

                    TransferenciaRequest request = TransferenciaRequest.builder()
                            .fromId(origemId)
                            .toId(destinoId)
                            .valor(new BigDecimal("1000.00"))
                            .build();

                    service.transferir(request);
                    sucessos.incrementAndGet();
                } catch (Exception e) {
                    if (e.getMessage().contains("Saldo insuficiente")) {
                        falhasSaldoInsuficiente.incrementAndGet();
                    }
                }
            });
        }

        executor.shutdown();
        executor.awaitTermination(30, TimeUnit.SECONDS);

        Beneficio origemFinal = repository.findById(origemId).orElseThrow();
        Beneficio destinoFinal = repository.findById(destinoId).orElseThrow();

        // Verifica que houve transferências bem-sucedidas (mínimo 2, máximo 3)
        assertThat(sucessos.get()).isGreaterThanOrEqualTo(2);
        assertThat(sucessos.get()).isLessThanOrEqualTo(3);
        assertThat(falhasSaldoInsuficiente.get()).isGreaterThan(0);

        // Verifica consistência: soma total preservada
        BigDecimal somaTotal = origemFinal.getValor().add(destinoFinal.getValor());
        assertThat(somaTotal).isEqualByComparingTo("3001.00"); // 3000.00 + 1.00 inicial

        System.out.println("=== TESTE DE RACE CONDITION ===");
        System.out.println("Sucessos: " + sucessos.get());
        System.out.println("Falhas por saldo insuficiente: " + falhasSaldoInsuficiente.get());
        System.out.println("Saldo origem final: " + origemFinal.getValor());
        System.out.println("Saldo destino final: " + destinoFinal.getValor());
    }
}
