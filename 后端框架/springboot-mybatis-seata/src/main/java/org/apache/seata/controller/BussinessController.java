package org.apache.seata.controller;


import lombok.extern.slf4j.Slf4j;
import org.apache.seata.TestData;
import org.apache.seata.e2e.E2EUtil;
import org.apache.seata.e2e.ResponseWrapper;
import org.apache.seata.service.BusinessService;
import org.apache.seata.spring.annotation.GlobalTransactional;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;



@Slf4j
@RestController
@RequestMapping(value = "/api/v1")
public class BussinessController {

    @Resource
    BusinessService businessService;

    @PostMapping("/purchase")
    public ResponseWrapper purchase(@RequestParam(value = "userId") String userId,
                                    @RequestParam(value = "commodityCode") String commodityCode,
                                    @RequestParam(value = "orderCount") int orderCount) {
        try {
            businessService.purchase(userId, commodityCode, orderCount);
            ResponseWrapper  responseWrapper = new ResponseWrapper();

            responseWrapper.setStatusCode(HttpStatus.OK.value());
            responseWrapper.setMessage("购买或预约成功");
            return responseWrapper;
        } catch (Exception e) {
            ResponseWrapper responseWrapper = new ResponseWrapper();
            responseWrapper.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
            responseWrapper.setMessage("购买或预约失败：" + e.getMessage());
            return responseWrapper;
        }
//        String res =  "{\"res\": \"success\"}";


//        responseWrapper.setData(serviceResult.getData()); // 假设getData() 返回你希望返回给客户端的数据
    }
}
