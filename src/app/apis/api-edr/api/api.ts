export * from './capabilities.service';
import { CapabilitiesService } from './capabilities.service';
export * from './collectionDataQueries.service';
import { CollectionDataQueriesService } from './collectionDataQueries.service';
export * from './collectionMetadata.service';
import { CollectionMetadataService } from './collectionMetadata.service';
export * from './instanceDataQueries.service';
import { InstanceDataQueriesService } from './instanceDataQueries.service';
export * from './instanceMetadata.service';
import { InstanceMetadataService } from './instanceMetadata.service';
export const APIS = [CapabilitiesService, CollectionDataQueriesService, CollectionMetadataService, InstanceDataQueriesService, InstanceMetadataService];