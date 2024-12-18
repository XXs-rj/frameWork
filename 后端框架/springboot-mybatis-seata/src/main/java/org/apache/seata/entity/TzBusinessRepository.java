package org.apache.seata.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import lombok.Data;
import org.springframework.stereotype.Repository;

@Data
@TableName("tz_business_repository")
@Repository
public class TzBusinessRepository extends Model<TzBusinessRepository> {
    private static final long serialVersionUID = 1L;

    @TableId(value = "goods_id")
    // 假设这是商品的唯一标识
    private String goodsId;

    @TableField(value = "goods_score")
    private String goodsScore;

    // 其他属性，如商品名称、价格、库存等
    @TableField(value = "goods_name")
    private String goodsName;

    @TableField(value = "price")
    private Double price;

    // 假设这是商品的热度值
    @TableField(value = "popularity")
    private Integer popularity;
}
