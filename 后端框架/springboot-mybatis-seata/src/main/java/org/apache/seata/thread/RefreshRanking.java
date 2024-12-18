package org.apache.seata.thread;

import org.apache.seata.constant.RankConstant;
import org.apache.seata.entity.TzBusinessRepository;
import org.apache.seata.service.ITzBussinessGoodsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 定期器、定时删除排行榜缓存并进行新数据预热
 *
 * @date 2024/12/13
 * @author kksong
 * @version 1.0
 */
@Component
@EnableScheduling
public class RefreshRanking {

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Autowired
    private ITzBussinessGoodsService tzBussinessGoodsService;

    @Resource
    private RankConstant rankConstant;


    @Scheduled(fixedRate = 120000) // 每120秒（2分钟）执行一次
    public void redisInit() {
        // 删除原有的哈希数据和有序集合数据
        stringRedisTemplate.delete(rankConstant.BUSINESS_GOODS_RANK);
        stringRedisTemplate.delete(rankConstant.BUSINESS_GOODS_HASH);

        // 将自己的业务数据先存入Redis中完成预热
        List<TzBusinessRepository> tzBusinessGoodsDtos = tzBussinessGoodsService.
                selectTzBusinessGoodsList();

        HashOperations<String, String, String> hashOps = stringRedisTemplate.opsForHash();
        ZSetOperations<String, String> zSetOps = stringRedisTemplate.opsForZSet();

        for (TzBusinessRepository tzBusinessGoods : tzBusinessGoodsDtos) {
            // 构建哈希树
            Map<String, String> goodsMap = new HashMap<>();
            goodsMap.put(tzBusinessGoods.getGoodsName(), String.valueOf(tzBusinessGoods.getPrice()));

            // 将商品信息添加到哈希中
            hashOps.putAll(rankConstant.BUSINESS_GOODS_HASH, goodsMap.entrySet().stream()
                    .collect(Collectors.toMap(
                            Map.Entry::getKey,
                            Map.Entry::getValue
                    )));

            // 将商品ID和热度值添加到有序集合中
            zSetOps.add(rankConstant.BUSINESS_GOODS_RANK, tzBusinessGoods.getGoodsId(), tzBusinessGoods.getPopularity());
        }
    }
}
