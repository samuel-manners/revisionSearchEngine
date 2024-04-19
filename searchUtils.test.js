//const searchUtils = require('./searchUtils')
const {searchHandler, cacheSearch, dbSearch} = require('./searchUtils');

test('Testing searchHandler function', () => {
    //Takes searchType and searchParam as parameters
    //Returns array
})

test('Testing cache searching with name search', async () => {
    //Gets real results from cacheSearch Function
    const results = await cacheSearch("name'Coca-Cola'");

    //Test data to compare to
    const cokeCan = createJSONObject('Coca-Cola Can', 'Beverage can', 'Metal', 'The Coca-Cola Company');
    const cokeBottle = createJSONObject('Coca-Cola Bottle', 'Plastic Beverage Bottle', 'Plastic', 'The Coca-Cola Company');
    const expectedResults = [cokeCan, cokeBottle];
    
    //Compares results
    expect(results).toStrictEqual(expectedResults);
})

test('Testing cache searching with name search', async () => {
    //Gets real results from cacheSearch Function
    const results = await cacheSearch("brand'The Coca-Cola Company'");
    
    //Test data to compare to
    const cokeCan = createJSONObject('Coca-Cola Can', 'Beverage can', 'Metal', 'The Coca-Cola Company');
    const dietCokeCan = createJSONObject('Diet Coke Can', 'Beverage Can', 'Metal', 'The Coca-Cola Company')
    const cokeZeroBottle = createJSONObject('Coke Zero Bottle', 'Plastic Beverage Bottle', 'Plastic', 'The Coca-Cola Company')
    const cokeBottle = createJSONObject('Coca-Cola Bottle', 'Plastic Beverage Bottle', 'Plastic', 'The Coca-Cola Company');
    const dietCokeBottle = createJSONObject('Diet Coke Bottle', 'Plastic Beverage Bottle', 'Plastic', 'The Coca-Cola Company');
    const expectedResults = [cokeCan, dietCokeCan, cokeZeroBottle, cokeBottle, dietCokeBottle];
    
    //Compares results
    expect(results).toStrictEqual(expectedResults);
    
})

/*
test('Testing database search', async () => {
    const connection = jest.fn();

    const results = await dbSearch('name', 'Coca-Cola');
    const cokeCan = createJSONObject('Coca-Cola Can', 'Beverage can', 'Metal', 'The Coca-Cola Company');
    const cokeBottle = createJSONObject('Coca-Cola Bottle', 'Plastic Beverage Bottle', 'Plastic', 'The Coca-Cola Company');
    const expectedResults = [cokeCan, cokeBottle];
    expect(results).toStrictEqual(expectedResults);

    //Takes searchType and searchParam as parameters
    //Returns array
}, 500000)
*/

function createJSONObject(nameData, descriptionData, recycleTypeData, brandData){
    return {
        name: nameData,
        description: descriptionData,
        recycleType: recycleTypeData,
        brand: brandData
    };
}