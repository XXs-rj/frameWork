package org.apache.seata.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import io.lettuce.core.RedisClient;
import io.lettuce.core.RedisURI;
import io.lettuce.core.ScoredValue;
import io.lettuce.core.ZAddArgs;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.api.sync.RedisCommands;
import org.apache.seata.constant.RankConstant;
import org.apache.seata.dao.TzBusinesRepositoryMapper;
import org.apache.seata.entity.TzBusinessRepository;
import org.apache.seata.model.TzBusinessGoods;
import org.apache.seata.service.ITzBussinessGoodsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.time.Duration;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 排行榜接口实现类
 *
 * @author kksong
 * @date 2024/12/12
 * @version 1.0
 */
@Transactional
@Service
public class ITzBussinessGoodsServiceImpl extends ServiceImpl<TzBusinesRepositoryMapper, TzBusinessRepository>
        implements ITzBussinessGoodsService {

    @Value("${spring.redis.host}")
    private String url;

    @Value("${spring.redis.port}")
    private Integer port;

    private String databaseName = "business_goods_rank";

    @Resource
    private TzBusinessRepository tzBusinesRepository;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Autowired
    private RankConstant rankConstant;

    @Override
    public TzBusinessGoods selectTzBusinessGoodsByGoodsId(String goodsId) {
        RedisURI redisURI = RedisURI.builder()   //《1》 创建单机连接的连接信息
                .withHost(url)
                .withPort(port)
                .withTimeout(Duration.of(10, ChronoUnit.SECONDS))
//                .withDatabase(1)  // 可筛选让其存储在redis中的哪个数据表中,默认在DB0
                .build();

        RedisClient redisClient = RedisClient.create(redisURI);  // <2> 创建客户端
        StatefulRedisConnection<String, String> connection = redisClient.connect(redisURI);
        RedisCommands<String, String> redisCommands = connection.sync(); // <4> 创建同步命令

//        String goodsScore = redisCommands.get(goodsId);
//        redisCommands.set(goodsId, String.valueOf(goodsScore + 1));

        Double goodsScore = redisCommands.zscore(databaseName, goodsId);
        redisCommands.zadd(databaseName, ScoredValue.just((goodsScore + 1), goodsId));

        TzBusinessGoods tzBusinessGoods = new TzBusinessGoods();
        tzBusinessGoods.setGoodsId(goodsId);
        tzBusinessGoods.setGoodsScore(String.valueOf(goodsScore + 1));

        return tzBusinessGoods;
    }

    @Override
    public List<TzBusinessRepository> selectTzBusinessGoodsList() {
        List<TzBusinessRepository> results = tzBusinesRepository.selectAll();
        return results;
    }

    @Override
    public TzBusinessRepository getGoodsFromSQL(String goodsId) {
        TzBusinessRepository result = tzBusinesRepository.selectById(goodsId);
        return result;
    }

    // 新增或更新一条该userid用户在搜索栏的历史记录（计数为1的简单实现）
    @Override
    public boolean addSearchHistoryByUserId(String userId, String goodsId, String tableName) {
        HashOperations<String, String, String> userInfoOps = stringRedisTemplate.opsForHash();
        userInfoOps.put(rankConstant.BUSINESS_USER_INFO, userId, tableName);

        Double count = stringRedisTemplate.opsForZSet().incrementScore(tableName, goodsId, 1.0);

        if (updateSearchInfo(goodsId))
            return  count > 0;
        else
            return count < 0;

//        return count > 0; // 通常，我们会期望这个操作总是成功的，除非Redis有问题
    }

    @Override
    public List<TzBusinessRepository> getRankInfo(Integer num) {
        try {
            Set<ZSetOperations.TypedTuple<String>> hotnessRanking = stringRedisTemplate.opsForZSet().reverseRangeWithScores(rankConstant.BUSINESS_GOODS_RANK, 0, num-1);

            List<TzBusinessRepository> resultList = new ArrayList<>();
            for (ZSetOperations.TypedTuple<String> tuple : hotnessRanking) {
                TzBusinessRepository tzBusinessRepository1 = new TzBusinessRepository();
                String productId = tuple.getValue();
                tzBusinessRepository1.setGoodsScore(String.valueOf(tuple.getScore()));
                tzBusinessRepository1.setGoodsId(productId);

                if (tzBusinessRepository1 != null) {
                    resultList.add(tzBusinessRepository1);
                }
            }

            return resultList;
        } catch (Exception e) {
            // 日志记录
            log.error("Failed to list goods", e);
            return  null;
        }
    }

    @Override
    public List<String> searchInfo(String info) {
        List<String> results = new ArrayList<>();
        String values = stringRedisTemplate.opsForValue().get("searchInfo");
        for (int i = 0; i < values.split("，").length; i++) {
            results.add(values.split("，")[i]);
        }

        List<String> list = results.stream().filter(str -> str.contains(info)).collect(Collectors.toList());

        return list;
    }

    @Override
    public boolean updateSearchInfo(String info) {
        String values = stringRedisTemplate.opsForValue().get("searchInfo");
        if (!values.contains(info)) {
            String results = values + "，" + info;
            stringRedisTemplate.opsForValue().set("searchInfo", results);
        }
        return true;
    }
}
