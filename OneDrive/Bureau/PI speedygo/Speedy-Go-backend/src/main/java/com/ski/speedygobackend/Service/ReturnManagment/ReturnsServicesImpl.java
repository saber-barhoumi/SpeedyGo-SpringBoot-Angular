package com.ski.speedygobackend.Service.ReturnManagment;

import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Parcel;
import com.ski.speedygobackend.Entity.ReturnManagment.Returns;
import com.ski.speedygobackend.Repository.IParcelRepository;
import com.ski.speedygobackend.Repository.IReturnsRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class ReturnsServicesImpl implements IReturnsServices {
    @Autowired
    IReturnsRepository returnRepository;
    @Autowired
    IParcelRepository parcelRepository;


//    public ReturnsServicesImpl(IReturnsRepository returnRepository) {
//        this.returnRepository = returnRepository;
//    }


    @Override
    public List<Returns> getAllReturns() {
        return returnRepository.findAll();
    }

    @Override
    public Returns getReturnsById(Long id) {
        return returnRepository.findById(id).orElse(null);
    }

    @Override
    public Returns saveReturns(Returns returns) {
        return returnRepository.save(returns);
    }

    @Override
    public void deleteReturns(Long id) {
        returnRepository.deleteById(id);

    }

    @Override
    public Returns assignParcelToReturn(Long returnId, Long parcelId) {
        return null;
    }

   /* @Override
    public Returns assignParcelToReturn(Long returnId, Long parcelId) {
        System.out.println("////////");
        Optional<Returns> returnOpt = returnRepository.findById(returnId);
        System.out.println(returnOpt);
        Optional<Parcel> parcelOpt = parcelRepository.findById(parcelId);
        System.out.println(parcelOpt);

        if (returnOpt.isPresent() && parcelOpt.isPresent()) {
            Returns returns = returnOpt.get();
            Parcel parcel = parcelOpt.get();

        //    returns.setParcel(parcel);
            return returnRepository.save(returns);
        } else {
            throw new RuntimeException("Return or Parcel not found!");
        }
    }
    */


    @Transactional
    public Returns assignParcelToReturn(Long parcelId, Returns returns) {
        Parcel parcel = parcelRepository.findById(parcelId)
                .orElseThrow(() -> new RuntimeException("Parcel not found"));


        returns.setParcel(parcel);


        parcel.getReturnss().add(returns);


        Returns savedReturn = returnRepository.save(returns);


        return savedReturn;
    }
}