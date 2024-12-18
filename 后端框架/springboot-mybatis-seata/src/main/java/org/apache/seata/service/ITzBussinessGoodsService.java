package org.apache.seata.service;

import com.baomidou.mybatisplus.extension.service.IService;

import org.apache.seata.entity.TzBusinessRepository;
import org.apache.seata.model.TzBusinessGoods;
import org.springframework.stereotype.Component;

import java.util.List;


public interface ITzBussinessGoodsService extends IService<TzBusinessRepository> {

    /**
     * 获取所有数据
     * @return
     */
    public List<TzBusinessRepository> selectTzBusinessGoodsList();

    /**
     * 从数据库获取商品的信息
     *
     * @param goodsId
     * @return
     */
    public TzBusinessRepository getGoodsFromSQL(String goodsId);

    /**
     * 获取某项产品的信息
     *
     * @param goodsId
     * @return
     */
    public TzBusinessGoods selectTzBusinessGoodsByGoodsId(String goodsId);
//    TzBusinessGoods selectTzBusinessGoodsByAll(TzBusinessGoods tzBusinessGoods);

    /**
     * 根据特定用户查询增加查询记录
     *
     * @param userId 用户
     * @param goodsId 查询物品
     * @return
     */
    public boolean addSearchHistoryByUserId(String userId, String goodsId, String tableName);

    /**
     * 获取排行榜排名
     *
     * @param num
     * @return
     */
    public List<TzBusinessRepository> getRankInfo(Integer num);

    /**
     * 当输入搜索信息info时，搜索框下会出现提示信息
     *
     * @return
     */
    public List<String> searchInfo(String info);

    /**
     * 更新、添加搜索框提示信息
     *
     * @param info
     * @return
     */
    public boolean updateSearchInfo(String info);
}
