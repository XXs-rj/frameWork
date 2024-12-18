package org.apache.seata;

import io.lettuce.core.*;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.api.sync.RedisCommands;
import io.lettuce.core.codec.Utf8StringCodec;
import io.lettuce.core.masterslave.MasterSlave;
import io.lettuce.core.masterslave.StatefulRedisMasterSlaveConnection;
import io.lettuce.core.resource.ClientResources;
import io.lettuce.core.support.ConnectionPoolSupport;
import lombok.extern.slf4j.Slf4j;
import org.apache.catalina.Pipeline;
import org.apache.commons.pool2.impl.GenericObjectPoolConfig;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.jupiter.api.Assertions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.junit.jupiter.api.Test;


import org.springframework.boot.autoconfigure.data.redis.RedisProperties;
import org.springframework.boot.test.context.SpringBootTest;


import java.time.Duration;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import static org.apache.seata.e2e.ConnectionCommands.CONNECTION;

@SpringBootTest
@Slf4j
public class TestApplication {

    @Value("${spring.redis.host}")
    private String url;

    @Value("${spring.redis.port}")
    private Integer port;

    public static io.lettuce.core.api.sync.RedisCommands<String, String> COMMAND;

    @BeforeClass
    public static void beforeClass() {
        COMMAND = CONNECTION.sync();
    }

    @Test
    public void contextLoads() {
        RedisURI redisURI = RedisURI.builder()   //《1》 创建单机连接的连接信息
                .withHost(url)
                .withPort(port)
                .withTimeout(Duration.of(10, ChronoUnit.SECONDS))
//                .withDatabase(1)  // 可筛选让其存储在redis中的哪个数据表中,默认在DB0
                .build();

        RedisClient redisClient = RedisClient.create(redisURI);  // <2> 创建客户端
        StatefulRedisConnection<String, String> connection = redisClient.connect(redisURI); // <3> 创建线程安全的连接
        RedisCommands<String, String> redisCommands = connection.sync(); // <4> 创建同步命令
        SetArgs setArgs = SetArgs.Builder.nx().ex(100); // 设置100秒的过期时间,令其在数据库中存在100秒然后数据自动删除
        String result = redisCommands.set("name", "throwable", setArgs);
        result = redisCommands.get("name");
        System.out.println("数据库结果:" + result);

        connection.close();
        redisClient.shutdown();

    }

//    @Test
//    public void testJedisPipeline() {
//        RedisProperties.Jedis jedis = new RedisProperties.Jedis();
//        Pipeline pipeline = jedis.pipe
//    }


    /**
     * 普通主从模式
     *
     * 假设现在有二个Redis服务形成树状主从关系如下：
     *      节点一：localhost:6379, 角色为Master
     *      节点二：localhost:6380, 角色为Slavor,节点一的从节点
     */
//    @Test
//    public void testDynamicReplica() {
//        List<RedisURI> uris = new ArrayList<>();
//        RedisURI uri1 = RedisURI.builder().withHost(url).withPort(port).build();
//        RedisURI uri2 = RedisURI.builder().withHost(url).withPort(6380).build();
//        uris.add(uri1);
//        uris.add(uri2);
//        RedisClient redisClient = RedisClient.create();
//        StatefulRedisMasterSlaveConnection<String, String> connection = MasterSlave.connect(redisClient, new Utf8StringCodec(), uris);
//
//        // 只从主节点读取数据
//        connection.setReadFrom(ReadFrom.SLAVE);
////      // 执行其他redis命令
//        connection.close();
//        redisClient.shutdown();
//    }

    @Test
    public void testDelBigHashKey() {
        RedisURI redisURI = RedisURI.builder()   //《1》 创建单机连接的连接信息
                .withHost(url)
                .withPort(port)
                .withTimeout(Duration.of(10, ChronoUnit.SECONDS))
//                .withDatabase(1)  // 可筛选让其存储在redis中的哪个数据表中,默认在DB0
                .build();

        RedisClient redisClient = RedisClient.create(redisURI);  // <2> 创建客户端
        StatefulRedisConnection<String, String> connection = redisClient.connect(redisURI);
        RedisCommands<String, String> redisCommands = connection.sync(); // <4> 创建同步命令
        ScanArgs scanArgs = ScanArgs.Builder.limit(2);
        ScanCursor cursor = ScanCursor.INITIAL;
        String key = "BIG_HASH_KEY";

        preparHashTestData(redisCommands, key);
        log.info("开始渐进式删除Hash的元素...");
        int counter = 0;
        do {
            MapScanCursor<String, String> result = redisCommands.hscan(key, cursor, scanArgs);

            cursor = ScanCursor.of(result.getCursor());
            cursor.setFinished(result.isFinished());
            Collection<String> fields = result.getMap().values();
            if (!fields.isEmpty()) {
                redisCommands.hdel(key, fields.toArray(new String[0]));
            }

            counter++;
        } while (!(ScanCursor.FINISHED.getCursor().equals(cursor.getCursor())) && ScanCursor.FINISHED.isFinished() == cursor.isFinished());
        log.info("渐进式删除Hash的元素完毕，迭代次数：{} ...", counter);
    }

    private void preparHashTestData(RedisCommands<String, String> redisCommands, String key) {
        redisCommands.hset(key, "1", "1");
        redisCommands.hset(key, "2", "2");
        redisCommands.hset(key, "3", "3");
        redisCommands.hset(key, "4", "4");
        redisCommands.hset(key, "5", "5");
    }
}
