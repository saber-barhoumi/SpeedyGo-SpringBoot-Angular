package com.ski.speedygobackend.Controller.ParcelPaymentManagement;

import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Parcel;
import com.ski.speedygobackend.Service.ParcelPaymentManagement.IParcelServices;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("parcel")
@RestController
public class ParcelRestController {
    private final IParcelServices parcelServices;
    @Autowired // Explicitly tell Spring to inject this dependency
    public ParcelRestController(IParcelServices parcelServices) {
        this.parcelServices = parcelServices;
    }
    @PostMapping("/add")
    public Parcel addParcel(@RequestBody Parcel parcel) {
        return parcelServices.addParcel(parcel);
    }

    @PutMapping("/update/{parcelId}")
    public Parcel updateParcel(@PathVariable Long parcelId, @RequestBody Parcel parcel){
        return parcelServices.updateParcel(parcelId,parcel);
    }

    @GetMapping("get/{parcelId}")
    public Parcel getParcel (@PathVariable Long parcelId){
        return parcelServices.retrieveParcel(parcelId);
    }

    @GetMapping("/getAll")
    public List<Parcel> getAll(){
        return parcelServices.retrieveAll();
    }

    @DeleteMapping("/delete/{parcelId}")
    public void deleteParcel (@PathVariable Long parcelId){
        parcelServices.deleteParcel(parcelId);
    }
}