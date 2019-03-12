import React, { Component } from 'react';
import { Text, Button } from 'react-native';
import { connect } from 'react-redux';
import ProductsModel from 'lib/database/models/Products';
import database from 'lib/database/Database';
import { logOut as logOutAction } from 'store/modules/auth/actions';
import { test as testRequest } from 'lib/api/auth';

class Products extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: 'Products',
    headerRight: (
      <Button
        onPress={() => navigation.state.params.logOut()}
        title="Log Out"
      />
    ),
    headerLeft: (
      <Button
        onPress={() => navigation.state.params.makeTestRequest()}
        title="Test"
      />
    ),
    gesturesEnabled: false,
  });

  state = {
    products: [],
  };

  async componentDidMount() {
    const db = await database.getDatabase();
    const model = new ProductsModel(db);
    const products = await model.get();

    this.setState({ products });

    const { navigation, logOut } = this.props;

    navigation.setParams({ logOut, makeTestRequest: this.makeTestRequest });
  }

  async makeTestRequest() {
    await testRequest();

    alert('Request Successful');
  }

  render() {
    const { products } = this.state;

    return products.map(product => <Text key={product.product_id}>{product.name}</Text>);
  }
}

const mapDispatchToProps = dispatch => ({
  logOut: () => dispatch(logOutAction()),
});

export default connect(null, mapDispatchToProps)(Products);
