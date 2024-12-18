package org.apache.seata.e2e;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.apache.seata.model.TzBusinessGoods;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;

// 假设有一个 PageUtils 类来处理分页逻辑
public class PageUtils {
    public static IPage<Object> startPage() {
        // 这里可以根据需求设置分页参数，例如每页显示数量
        int pageSize = 10;
        Page<Object> page = new Page<>(1, pageSize);
        return page;
    }

    public static List<TzBusinessGoods> getDataTable(TzBusinessGoods list) {
        // 转换逻辑，根据实际需求实现
        List<TzBusinessGoods> tableDataInfo = null;
        tableDataInfo.add(list);
        // 其他字段设置
        return tableDataInfo;
    }
}
