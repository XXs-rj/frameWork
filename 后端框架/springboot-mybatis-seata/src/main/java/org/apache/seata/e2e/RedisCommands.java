package org.apache.seata.e2e;

import io.lettuce.core.api.StatefulRedisConnection;
import org.junit.BeforeClass;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.apache.seata.e2e.ConnectionCommands.*;

import static org.apache.seata.e2e.ConnectionCommands.CONNECTION;

@Configuration
public class RedisCommands {
    public static io.lettuce.core.api.sync.RedisCommands<String, String> COMMAND;

    @BeforeClass
    public static void beforeClass() {
        COMMAND = CONNECTION.sync();
    }
}
