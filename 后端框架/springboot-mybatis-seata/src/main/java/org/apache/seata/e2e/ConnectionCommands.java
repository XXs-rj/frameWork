package org.apache.seata.e2e;

import io.lettuce.core.RedisClient;
import io.lettuce.core.RedisURI;
import io.lettuce.core.api.StatefulRedisConnection;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.time.temporal.ChronoUnit;

@Configuration
public class ConnectionCommands {
    public static StatefulRedisConnection<String, String> CONNECTION;

    public static RedisClient CLIENT;

    @BeforeClass
    public static void beforeClass() {
        RedisURI redisUri = RedisURI.builder()
                .withHost("localhost")
                .withPort(6379)
                .withTimeout(Duration.of(10, ChronoUnit.SECONDS))
                .build();
        CLIENT = RedisClient.create(redisUri);
        CONNECTION = CLIENT.connect();
    }

    @AfterClass
    public static void afterClass() throws Exception {
        CONNECTION.close();
        CLIENT.shutdown();
    }
}
