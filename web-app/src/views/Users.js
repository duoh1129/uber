import React,{ useState, useEffect, useContext } from 'react';
import MaterialTable from 'material-table';
import { useSelector, useDispatch } from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { 
  features ,
  dateStyle,
  language
} from 'config';
import { FirebaseContext } from 'common';

export default function Users() {
  const { api } = useContext(FirebaseContext);
  const {
    editUser, 
    deleteUser
  } = api;
  const [data, setData] = useState([]);
  const [cars, setCars] = useState({});
  const usersdata = useSelector(state => state.usersdata);
  const cartypes = useSelector(state => state.cartypes);
  const dispatch = useDispatch();

  useEffect(()=>{
    if(usersdata.users){
        setData(usersdata.users);
    }else{
      setData([]);
    }
  },[usersdata.users]);

  useEffect(()=>{
    if(cartypes.cars){
        let obj =  {};
        cartypes.cars.map((car)=> obj[car.name]=car.name)
        setCars(obj);
    }
  },[cartypes.cars]);

  const columns = [
      { title: language.createdAt, field: 'createdAt', editable:'never', defaultSort:'desc',render: rowData => rowData.createdAt?new Date(rowData.createdAt).toLocaleString(dateStyle):null},
      { title: language.first_name, field: 'firstName', editable:'never'},
      { title: language.last_name, field: 'lastName', editable:'never'},
      { title: language.user_type, field: 'usertype', editable:'never'},
      { title: language.email, field: 'email', editable:'never'},
      { title: language.mobile, field: 'mobile', editable:'never'},
      { title: language.profile_image,  field: 'profile_image',render: rowData => rowData.profile_image?<img alt='Profile' src={rowData.profile_image} style={{width: 50,borderRadius:'50%'}}/>:null, editable:'never'},
      { title: language.vehicle_model, field: 'vehicleModel', editable:'never'},
      { title: language.vehicle_no, field: 'vehicleNumber', editable:'never'},
      { title: language.car_type, field: 'carType',lookup: cars},
      { title: language.account_approve,  field: 'approved', type:'boolean'},
      { title: language.driver_active,  field: 'driverActiveStatus', type:'boolean'},
      { title: language.lisence_image,  field: 'licenseImage',render: rowData => rowData.licenseImage?<img alt='License' src={rowData.licenseImage} style={{width: 100}}/>:null, editable:'never'},
      { title: language.wallet_balance,  field: 'walletBalance', type:'numeric', editable:'never'},
      { title: language.signup_via_refferal, field: 'signupViaReferral', type:'boolean', editable:'never'},
      { title: language.refferal_id,  field: 'refferalId', editable:'never'},
      { title: language.bankName,  field: 'bankName', editable:'never'},
      { title: language.bankCode,  field: 'bankCode', editable:'never'},
      { title: language.bankAccount,  field: 'bankAccount', editable:'never'},
      { title: language.queue,  field: 'queue', type:'boolean'},
  ];

  return (
    usersdata.loading? <CircularLoading/>:
    <MaterialTable
      title={language.all_user}
      columns={columns}
      data={data}
      options={{
        exportButton: true,
        sorting: true,
      }}
      editable={{
        onRowUpdate: (newData, oldData) =>
          new Promise(resolve => {
            setTimeout(() => {
              resolve();
              dispatch(editUser(oldData.id,newData));
            }, 600);
          }),
        onRowDelete: oldData =>
          features.AllowCriticalEditsAdmin?
          new Promise(resolve => {
            setTimeout(() => {
              resolve();
              dispatch(deleteUser(oldData.id));
            }, 600);
          })
          :
          new Promise(resolve => {
            setTimeout(() => {
              resolve();
              alert('Restricted in Demo App.');
            }, 600);
          })
          , 
      }}
    />
  );
}
