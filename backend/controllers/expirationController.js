// 카테고리 번호와 일치하는 기준 정보를 데이터베이스에서 가져오거나
// 사용자가 기준 정보를 직접 입력하면
// 그 기준 값을 바탕으로 출력

/* 예상 예시 데이터 - 준희
{
  "name": "Milk",
  "manufactureDate": "2023-06-01",
  "shelfLifeDays": 10,
  "category": 1,  // 드롭다운에서 사용자가 선택한 카테고리를 번호로 처리
  "openedDate": "2023-06-05"
}

*/


const { Product, Category } = require('../models');

// 소비기한 계산 함수
const calculateExpiration = (date, shelfLifeDays) => {
  const expirationDate = new Date(date);
  expirationDate.setDate(expirationDate.getDate() + shelfLifeDays);
  return expirationDate;
};

exports.addProduct = async (req, res) => {
  try {
    const { name, manufactureDate, shelfLifeDays, category, openedDate } = req.body;
    let expirationDate;
    let consumptionDate;

    // 사용자가 shelfLifeDays를 제공하지 않은 경우
    if (!shelfLifeDays && category) {
      // category는 사용자가 드롭다운에서 선택한 카테고리 번호
      const categoryInfo = await Category.findByPk(category);
      if (categoryInfo) {
        expirationDate = calculateExpiration(manufactureDate, categoryInfo.shelfLifeDays);
        if (openedDate) {
          consumptionDate = calculateExpiration(openedDate, categoryInfo.shelfLifeDays);
        }
      } else {
        return res.status(400).json({ error: 'Category not found and shelfLifeDays not provided.' });
      }
    } else if (shelfLifeDays) {
      expirationDate = calculateExpiration(manufactureDate, shelfLifeDays);
      if (openedDate) {
        consumptionDate = calculateExpiration(openedDate, shelfLifeDays);
      }
    } else {
      return res.status(400).json({ error: 'Either shelfLifeDays or category must be provided.' });
    }

    const product = await Product.create({ name, manufactureDate, shelfLifeDays, expirationDate, consumptionDate, category });
    res.status(201).json(product);
  } catch (error) {
    res.status500().json({ error: 'An error occurred while adding the product.' });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching the products.' });
  }
};




/*
const { Product, Category } = require('../models');

// 소비기한 계산 함수
const calculateExpiration = (manufactureDate, shelfLifeDays) => {
    const expirationDate = new Date(manufactureDate);
    expirationDate.setDate(expirationDate.getDate() + shelfLifeDays);
    return expirationDate;
};

exports.addProduct = async (req, res) => {
    try {
        const { name, manufactureDate, shelfLifeDays, category } = req.body;
        let expirationDate;

        // 사용자가 shelfLifeDays를 제공하지 않은 경우
        if (!shelfLifeDays && category) {
            const categoryInfo = await Category.findOne({ where: { name: category } });
            if (categoryInfo) {
                expirationDate = calculateExpiration(manufactureDate, categoryInfo.defaultShelfLifeDays);
            } else {
                return res.status(400).json({ error: 'Category not found and shelfLifeDays not provided.' });
            }
        } else if (shelfLifeDays) {
            expirationDate = calculateExpiration(manufactureDate, shelfLifeDays);
        } else {
            return res.status(400).json({ error: 'Either shelfLifeDays or category must be provided.' });
        }

        const product = await Product.create({ name, manufactureDate, shelfLifeDays, expirationDate, consumptionDate: expirationDate, category });
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while adding the product.' });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.findAll();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching the products.' });
    }
};
*/
