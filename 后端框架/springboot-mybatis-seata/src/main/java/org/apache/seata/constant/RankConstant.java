package org.apache.seata.constant;

import lombok.Data;
import org.springframework.context.annotation.Configuration;

/**
 * 排行榜常量信息
 *
 * @date 2024/12/13
 * @author kksong
 * @version 1.0
 */
@Data
@Configuration
public class RankConstant {

    public static final String BUSINESS_GOODS_HASH = "business_goods_hash";

    public static final String BUSINESS_GOODS_RANK = "business_goods_rank";

    public static final String BUSINESS_USER_INFO = "business_user_info";
}
