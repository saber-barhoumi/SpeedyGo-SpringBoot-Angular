package com.ski.speedygobackend.Controller.ParcelPaymentManagement;

import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Parcel;
import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Payment;
import com.ski.speedygobackend.Service.ParcelPaymentManagement.IParcelServices;
import com.ski.speedygobackend.Service.ParcelPaymentManagement.IPaymentServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin("*")
@RequestMapping("payment")
@RestController
public class PaymentRestController {
    private final IPaymentServices paymentServices;
    @Autowired // Explicitly tell Spring to inject this dependency
    public PaymentRestController(IPaymentServices paymentServices) {
        this.paymentServices = paymentServices;
    }
    @PostMapping("/add")
    public Payment addPayment(@RequestBody Payment payment) {
        return paymentServices.addPayment(payment);
    }

    @PutMapping("/update/{paymentId}")
    public Payment updatePayment(@PathVariable Long paymentId, @RequestBody Payment payment){
        return paymentServices.updatePayment(paymentId,payment);
    }

    @GetMapping("get/{paymentId}")
    public Payment getPayment (@PathVariable Long paymentId){
        return paymentServices.retrievePayment(paymentId);
    }

    @GetMapping("/getAll")
    public List<Payment> getAll(){
        return paymentServices.retrieveAll();
    }

    @DeleteMapping("/delete/{paymentId}")
    public void deletePayment (@PathVariable Long paymentId){
        paymentServices.deletePayment(paymentId);
    }
}


