# Ecommerce Store API

This project implements a simple ecommerce store API that allows clients to manage their shopping carts, place orders, and apply discount codes. It includes admin functionalities for generating discount codes and viewing purchase statistics.

## Features

- **Add Items to Cart**: Users can add items to their cart.
- **Checkout**: Users can checkout, apply discount codes, and place orders.
- **Discount Codes**: Every nth order gets a discount code for 10% off.
- **Admin Functions**:
  - Generate discount codes.
  - View statistics including total items purchased, total purchase amount, and discount codes.

## Tech Stack

- Node.js
- Express
- In-Memory Store (JavaScript Objects)

## API Endpoints

### User APIs

- **Add Item to Cart**
  - **POST** `/cart`
  - **Request Body**:
    ```json
    {
      "userId": "string",
      "itemId": "string",
      "quantity": number
    }
    ```
  - **Response**:
    ```json
    {
      "message": "Item added to cart successfully."
    }
    ```

- **Checkout**
  - **POST** `/checkout`
  - **Request Body**:
    ```json
    {
      "userId": "string",
      "discountCode": "string" // optional
    }
    ```
  - **Response**:
    ```json
    {
      "message": "Order placed successfully.",
      "totalAmount": number,
      "discountCode": "string" // if applicable
    }
    ```

### Admin APIs

- **Generate Discount Code**
  - **POST** `/admin/discount-code`
  - **Response**:
    ```json
    {
      "discountCode": "string"
    }
    ```

- **Get Admin Statistics**
  - **GET** `/admin/stats`
  - **Query Parameters**:
    - `page`: Page number for pagination (default: 1)
    - `limit`: Number of records per page (default: 10)
  - **Response**:
    ```json
    {
      "totalItemsPurchased": number,
      "totalPurchaseAmount": number,
      "discountCodes": [
        {
          "code": "string",
          "isValid": boolean
        }
      ],
      "currentPage": number,
      "totalPages": number
    }
    ```

## Getting Started

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/ecommerce-store.git
   cd ecommerce-store
