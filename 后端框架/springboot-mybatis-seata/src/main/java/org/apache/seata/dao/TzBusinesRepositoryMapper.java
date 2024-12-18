package org.apache.seata.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

import org.apache.seata.entity.TzBusinessRepository;
import org.springframework.stereotype.Repository;

@Mapper
@Repository
public interface TzBusinesRepositoryMapper extends BaseMapper<TzBusinessRepository> {

}
