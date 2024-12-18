package org.apache.seata.controller;

import lombok.extern.slf4j.Slf4j;
import org.apache.seata.Dto.SearchGoodsDto;
import org.apache.seata.constant.RankConstant;
import org.apache.seata.e2e.ResponseWrapper;
import org.apache.seata.entity.TzBusinessRepository;
import org.apache.seata.service.ITzBussinessGoodsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.*;

/**
 * 定时更新近期排行榜业务功能类
 *
 * @date 2024/12/13
 * @author kksong
 * @version 1.0
 */
@RestController
@Slf4j
@RequestMapping("/api/v1/rank")
public class TzBusinessGoodsController {

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Resource
    private ITzBussinessGoodsService tzBusinessGoodsService;

    @Resource
    private  ResponseWrapper responseWrapper;

    @Resource
    private RankConstant rankConstant;

//    @PostConstruct
//    public void redisInit() {
//        // 将自己的业务数据先存入Redis中完成预热
//        List<TzBusinessRepository> tzBusinessGoodsDtos = tzBusinessGoodsService.
//                selectTzBusinessGoodsList();
//
//        HashOperations<String, String, String> hashOps = stringRedisTemplate.opsForHash();
//        ZSetOperations<String, String> zSetOps = stringRedisTemplate.opsForZSet();
//
//        for (TzBusinessRepository tzBusinessGoods : tzBusinessGoodsDtos) {
//            // 构建哈希树
//            Map<String, String> goodsMap = new HashMap<>();
//            goodsMap.put(tzBusinessGoods.getGoodsName(), String.valueOf(tzBusinessGoods.getPrice()));
//
//            // 将商品信息添加到哈希中
//            hashOps.putAll(rankConstant.BUSINESS_GOODS_HASH, goodsMap.entrySet().stream()
//                    .collect(Collectors.toMap(
//                            Map.Entry::getKey,
//                            Map.Entry::getValue
//                    )));
//
//            // 将商品ID和热度值添加到有序集合中
//            zSetOps.add(rankConstant.BUSINESS_GOODS_RANK, tzBusinessGoods.getGoodsId(), tzBusinessGoods.getPopularity());
//        }
//    }

    /**
     * 搜索接口
     *
     * @param searchGoodsDto 搜索信息结构体
     * @return
     */
    @PostMapping(value = "/search")
    public ResponseWrapper searchGoods(@RequestBody SearchGoodsDto searchGoodsDto){
        if (tzBusinessGoodsService.addSearchHistoryByUserId(searchGoodsDto.getUserId(), searchGoodsDto.getGoodsId(), searchGoodsDto.getTableName())) {
            responseWrapper.setData(tzBusinessGoodsService.getGoodsFromSQL(searchGoodsDto.getGoodsId()));
            responseWrapper.setStatusCode(200);
            responseWrapper.setMessage("查询成功");
            return responseWrapper;
        } else {
            responseWrapper.setStatusCode(404);
            responseWrapper.setMessage("查询失败");
            return responseWrapper;
        }

    }

    /**
     * 点击产品，结果是 产品的点击数增加
     *
     * @param goodsId
     * @return
     */
    @GetMapping(value = "/getInfo/{goodsId}")
    public ResponseWrapper getInfo(@PathVariable("goodsId") String goodsId) {
        try {
//            stringRedisTemplate.opsForZSet().incrementScore("product:rank", goodsId.toString(), 1);
            responseWrapper.setData(tzBusinessGoodsService.selectTzBusinessGoodsByGoodsId(goodsId));
            return responseWrapper;
        } catch (Exception e) {
            // 日志记录
            log.error("Failed to get goods info", e);
            responseWrapper.setMessage("Failed to get goods info");
            return responseWrapper;
        }
    }

    /**
     * 获取排行榜列表
     *
     * @param num
     * @return
     */
    @GetMapping("/list")
    public List<TzBusinessRepository> wxList(@RequestParam(value = "num", required = true) Integer num) {
        return tzBusinessGoodsService.getRankInfo(num);
    }

    /**
     * 根据输入搜索字筛选出已拥有的查找记录
     *
     * @param info
     * @return
     */
    @GetMapping("/searchInfo")
    public List<String> searchInfo(@RequestParam(value="info", required = false) String info) {
        return tzBusinessGoodsService.searchInfo(info);
    }

}
