package fr.akensys.jtektserver.error.mean;

public class MeanNotFoundException extends RuntimeException {
    
    public MeanNotFoundException(String meanNumber) {
        super("Mean not found with number: " + meanNumber);
    }
}
