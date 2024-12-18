export function getCurrentChinaTime() {
    // 创建一个新的Date对象，这将获取当前的本地时间
    let now = new Date();
  
    // 获取年、月、日、小时、分钟和秒
    let year = now.getFullYear();
    let month = String(now.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要加1，并且确保是两位数
    let day = String(now.getDate()).padStart(2, '0'); // 确保是两位数
    let hours = String(now.getHours()).padStart(2, '0'); // 确保是两位数，并且这里是中国时间，不需要考虑UTC偏移
    let minutes = String(now.getMinutes()).padStart(2, '0'); // 确保是两位数
    let seconds = String(now.getSeconds()).padStart(2, '0'); // 确保是两位数
  
    // 拼接成所需的格式
    let formattedTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  
    return formattedTime;
  }

  export function formatDate(dateString) {
  // 创建一个 Date 对象（注意：这个字符串格式通常会被 Date 构造函数正确解析）
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要加1
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }