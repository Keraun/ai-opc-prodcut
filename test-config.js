const { readAllConfigs } = require('./lib/config-manager');

async function testConfig() {
  try {
    const configs = readAllConfigs();
    console.log('readAllConfigs() 返回结果:');
    console.log(JSON.stringify(configs, null, 2));
    
    console.log('\n主题配置:');
    console.log(JSON.stringify(configs.theme, null, 2));
    
    console.log('\n主题数量:', Object.keys(configs.theme.themes).length);
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testConfig();